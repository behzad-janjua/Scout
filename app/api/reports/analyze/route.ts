import { NextResponse } from "next/server";
import {
  getCall,
  getBusiness,
  getScenario,
  createReport,
} from "@/lib/data";
import { loadSampleAnalysis } from "@/lib/fixtures";
import { analyzeTranscript, nebiusConfigured } from "@/lib/nebius";
import type { Analysis } from "@/lib/nebius";

// POST /api/reports/analyze
// Body: { call_id }
// Sends the call's transcript (plus business type + scenario) to Nebius, parses
// and validates the structured report, and stores it. If Nebius is unavailable
// or returns bad output, falls back to the fixture analysis so the dashboard
// always renders a complete report.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const callId: string | undefined = body?.call_id;
  if (!callId) {
    return NextResponse.json({ error: "call_id is required" }, { status: 400 });
  }

  const call = await getCall(callId);
  if (!call) {
    return NextResponse.json({ error: "call not found" }, { status: 404 });
  }

  let analysis: Analysis | null = null;
  let analysisSource: "nebius" | "fallback_fixture" = "fallback_fixture";
  let fallbackReason: string | undefined;

  if (nebiusConfigured() && call.transcript.trim()) {
    try {
      const business = call.business_id ? await getBusiness(call.business_id) : null;
      const scenario = call.scenario_id ? await getScenario(call.scenario_id) : null;
      analysis = await analyzeTranscript({
        business: {
          name: business?.name ?? "the business",
          business_type: business?.business_type ?? "local business",
        },
        scenario: {
          title: scenario?.title ?? "Mystery shopper call",
          goal: scenario?.goal ?? "",
        },
        transcript: call.transcript,
      });
      analysisSource = "nebius";
    } catch (err) {
      fallbackReason = (err as Error).message;
    }
  } else if (!call.transcript.trim()) {
    fallbackReason = "call has no transcript";
  } else {
    fallbackReason = "Nebius not configured";
  }

  // Fallback: use the fixture analysis fields bound to this call.
  if (!analysis) {
    const sample = loadSampleAnalysis();
    const { report_id: _r, call_id: _c, created_at: _ca, ...fields } = sample;
    analysis = fields;
  }

  const report = await createReport({ ...analysis, call_id: callId });

  return NextResponse.json(
    {
      ...report,
      analysis_source: analysisSource,
      ...(fallbackReason ? { fallback_reason: fallbackReason } : {}),
    },
    { status: 201 }
  );
}
