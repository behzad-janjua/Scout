import { NextResponse } from "next/server";
import { getCall, createReport } from "@/lib/store";
import { loadSampleAnalysis } from "@/lib/fixtures";

// POST /api/reports/analyze
// Body: { call_id }
// Phase 4 implements the real Nebius call (load prompt, send transcript, parse
// + validate JSON). For now we attach the sample analysis to the given call so
// the dashboard renders a complete report.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const callId: string | undefined = body?.call_id;
  if (!callId) {
    return NextResponse.json({ error: "call_id is required" }, { status: 400 });
  }

  const call = getCall(callId);
  if (!call) {
    return NextResponse.json({ error: "call not found" }, { status: 404 });
  }

  // Placeholder analysis: clone the sample output, bound to this call.
  const sample = loadSampleAnalysis();
  const report = createReport({
    ...sample,
    report_id: `report_${callId}`,
    call_id: callId,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(report, { status: 201 });
}
