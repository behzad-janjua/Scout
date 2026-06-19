import { NextResponse } from "next/server";
import { getCallByVapiId, createCall, updateCall } from "@/lib/data";
import { normalizeWebhook, verifyWebhookSecret } from "@/lib/vapi";
import type { Call } from "@/lib/types";

// POST /api/calls/webhook — inbound Vapi call lifecycle events.
//
// Handles the events Vapi fires over a call's life: status-update (queued /
// ringing / in-progress / ended) and end-of-call-report (final transcript,
// recording, duration). Each event patches the matching call row so the
// dashboard and analysis step always see the latest state.
export async function POST(req: Request) {
  if (!verifyWebhookSecret(req.headers)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const event = normalizeWebhook(body);

  if (!event.vapiCallId) {
    return NextResponse.json(
      { ok: true, note: "no call id in payload; ignored" },
      { status: 200 }
    );
  }

  // Only persist fields the event actually carried, so a status-update doesn't
  // wipe a transcript already saved by an end-of-call-report (or vice versa).
  const patch: Partial<Omit<Call, "id" | "created_at">> = {};
  if (event.status) patch.status = event.status;
  if (event.startedAt) patch.started_at = event.startedAt;
  if (event.endedAt) patch.ended_at = event.endedAt;
  if (typeof event.durationSeconds === "number")
    patch.duration_seconds = event.durationSeconds;
  if (event.recordingUrl) patch.recording_url = event.recordingUrl;
  if (event.transcript) patch.transcript = event.transcript;
  if (event.failureReason) patch.failure_reason = event.failureReason;

  const existing = await getCallByVapiId(event.vapiCallId);

  if (!existing) {
    // Event arrived before /start finished its update — record a stub so the
    // data isn't dropped. /start matches on vapi_call_id afterwards.
    await createCall({
      business_id: "",
      scenario_id: "",
      provider: "vapi",
      vapi_call_id: event.vapiCallId,
      status: patch.status ?? "in_progress",
      started_at: patch.started_at ?? new Date().toISOString(),
      ended_at: patch.ended_at ?? null,
      duration_seconds: patch.duration_seconds ?? 0,
      recording_url: patch.recording_url ?? null,
      transcript: patch.transcript ?? "",
      failure_reason: patch.failure_reason ?? null,
    });
    return NextResponse.json({
      ok: true,
      vapi_call_id: event.vapiCallId,
      created_stub: true,
      type: event.type,
    });
  }

  const updated = await updateCall(existing.id, patch);
  return NextResponse.json({
    ok: true,
    call_id: existing.id,
    vapi_call_id: event.vapiCallId,
    status: updated?.status ?? existing.status,
    type: event.type,
    terminal: event.isTerminal,
  });
}
