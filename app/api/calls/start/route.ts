import { NextResponse } from "next/server";
import {
  createBusiness,
  createScenario,
  createCall,
  updateCall,
} from "@/lib/data";
import { loadDemoBundle, loadSampleTranscript } from "@/lib/fixtures";
import { buildCallVariables, startVapiCall, vapiConfigured } from "@/lib/vapi";

// POST /api/calls/start
// Body: { business, scenario, fallback }
// - fallback: true  -> return the pre-built demo report id (demo-safe path)
// - fallback: false -> create records, then place a live Vapi call. If the
//   live call can't be placed (not configured / Vapi error), fall back to a
//   simulated call seeded with the sample transcript so the pipeline still runs.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Demo-safe fallback: skip live calling entirely, return the prebuilt report.
  if (body?.fallback) {
    const demo = loadDemoBundle();
    return NextResponse.json({
      mode: "fallback",
      call_id: demo.call?.id,
      report_id: demo.report?.report_id,
    });
  }

  const b = body?.business ?? {};
  const s = body?.scenario ?? {};
  if (!b?.name) {
    return NextResponse.json(
      { error: "business.name is required to start a call" },
      { status: 400 }
    );
  }

  const business = await createBusiness({
    name: b.name,
    business_type: b.business_type ?? "other",
    phone_number: b.phone_number ?? "",
    owner_email: b.owner_email || undefined,
  });

  const scenario = await createScenario({
    business_id: business.id,
    title: s.title ?? "Untitled scenario",
    goal: s.goal ?? "",
    customer_persona: s.customer_persona ?? "",
    questions_to_ask:
      typeof s.questions_to_ask === "string"
        ? s.questions_to_ask.split("\n").map((q: string) => q.trim()).filter(Boolean)
        : Array.isArray(s.questions_to_ask)
          ? s.questions_to_ask
          : [],
  });

  // Record a queued call so webhook events (and the report) have a row to
  // attach to before Vapi responds.
  const call = await createCall({
    business_id: business.id,
    scenario_id: scenario.id,
    provider: "vapi",
    vapi_call_id: null,
    status: "queued",
    started_at: new Date().toISOString(),
    ended_at: null,
    duration_seconds: 0,
    recording_url: null,
    transcript: "",
    failure_reason: null,
  });

  // Try to place a real outbound call. Anything that goes wrong here drops to
  // the simulated-transcript fallback below — the demo must never hard-fail.
  if (vapiConfigured() && business.phone_number) {
    try {
      const variables = buildCallVariables(business, scenario);
      const result = await startVapiCall({
        destinationNumber: business.phone_number,
        variables,
      });
      const updated = await updateCall(call.id, {
        vapi_call_id: result.vapiCallId,
        status: result.status,
      });
      return NextResponse.json(
        {
          mode: "live",
          business_id: business.id,
          scenario_id: scenario.id,
          call_id: call.id,
          vapi_call_id: result.vapiCallId,
          status: updated?.status ?? result.status,
          note: "Live call placed. Transcript will arrive via webhook.",
        },
        { status: 201 }
      );
    } catch (err) {
      // Fall through to the simulated path with the reason recorded.
      return simulatedFallback(business.id, scenario.id, call.id, (err as Error).message);
    }
  }

  // Vapi not configured (or no destination number): simulate the call.
  return simulatedFallback(
    business.id,
    scenario.id,
    call.id,
    vapiConfigured()
      ? "business has no phone_number for a live call"
      : "Vapi not configured"
  );
}

// Seed the call with the sample transcript and mark it simulated. This keeps
// the downstream analyze/dashboard flow identical to a real completed call.
async function simulatedFallback(
  businessId: string,
  scenarioId: string,
  callId: string,
  reason: string
) {
  let transcript = "";
  try {
    transcript = loadSampleTranscript();
  } catch {
    transcript = "";
  }
  const startedAt = new Date().toISOString();
  await updateCall(callId, {
    provider: "fallback",
    status: "fallback_simulated",
    started_at: startedAt,
    ended_at: startedAt,
    duration_seconds: 132,
    recording_url: null,
    transcript,
    failure_reason: reason,
  });

  return NextResponse.json(
    {
      mode: "fallback_simulated",
      business_id: businessId,
      scenario_id: scenarioId,
      call_id: callId,
      status: "fallback_simulated",
      note: `Live call unavailable (${reason}). Loaded sample transcript so analysis can run.`,
    },
    { status: 201 }
  );
}
