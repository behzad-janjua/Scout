import { NextResponse } from "next/server";
import { getCallByVapiId, createCall, id } from "@/lib/store";

// POST /api/calls/webhook — inbound Vapi call events.
// Phase 3 implements signature verification + status/transcript updates.
// For now we accept the payload and upsert a minimal call record so the wiring
// can be tested end to end.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Vapi nests event data under `message` in most webhook payloads.
  const msg = body?.message ?? body;
  const vapiCallId: string | undefined =
    msg?.call?.id ?? msg?.callId ?? body?.vapi_call_id;

  if (!vapiCallId) {
    return NextResponse.json(
      { ok: true, note: "no call id in payload; ignored" },
      { status: 200 }
    );
  }

  const existing = getCallByVapiId(vapiCallId);
  if (!existing) {
    // Record a stub so we don't drop events that arrive before /start finishes.
    createCall({
      id: id("call"),
      business_id: "",
      scenario_id: "",
      provider: "vapi",
      vapi_call_id: vapiCallId,
      status: "in_progress",
      started_at: new Date().toISOString(),
      ended_at: null,
      duration_seconds: 0,
      recording_url: null,
      transcript: "",
      failure_reason: null,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true, vapi_call_id: vapiCallId });
}
