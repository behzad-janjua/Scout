import { NextResponse } from "next/server";
import { getCall, createReport } from "@/lib/data";
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

  const call = await getCall(callId);
  if (!call) {
    return NextResponse.json({ error: "call not found" }, { status: 404 });
  }

  // Placeholder analysis: clone the sample output, bound to this call.
  // (report_id/call_id from the fixture are dropped; the store assigns its own.)
  const sample = loadSampleAnalysis();
  const { report_id: _r, call_id: _c, created_at: _ca, ...fields } = sample;
  const report = await createReport({ ...fields, call_id: callId });

  return NextResponse.json(report, { status: 201 });
}
