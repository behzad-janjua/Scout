import { NextResponse } from "next/server";
import { createReport, getBusiness, getCall, getScenario } from "@/lib/data";
import { analyzeTranscript } from "@/lib/nebius";

// POST /api/reports/analyze
// Body: { call_id }
// Sends the real Vapi transcript to Nebius, validates the structured report,
// stores it, and returns the saved report. No fixture fallback is used on the
// primary live-demo path.
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
  if (!call.transcript.trim()) {
    return NextResponse.json(
      { error: "call transcript is not ready yet" },
      { status: 409 }
    );
  }

  const [business, scenario] = await Promise.all([
    getBusiness(call.business_id),
    getScenario(call.scenario_id),
  ]);
  if (!business || !scenario) {
    return NextResponse.json(
      { error: "call is missing business or scenario context" },
      { status: 409 }
    );
  }

  try {
    const analysis = await analyzeTranscript({
      business: {
        name: business.name,
        business_type: business.business_type,
      },
      scenario: {
        title: scenario.title,
        goal: scenario.goal,
      },
      transcript: call.transcript,
    });
    const report = await createReport({ ...analysis, call_id: callId });

    return NextResponse.json(
      { ...report, analysis_source: "nebius" },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
