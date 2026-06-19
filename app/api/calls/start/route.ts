import { NextResponse } from "next/server";
import {
  createBusiness,
  createScenario,
  createCall,
  updateCall,
} from "@/lib/data";
import { buildCallVariables, startVapiCall, vapiConfigured } from "@/lib/vapi";

// POST /api/calls/start
// Body: { business, scenario }
// Creates records, then places a live Vapi call.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const b = body?.business ?? {};
  const s = body?.scenario ?? {};
  if (!b?.name) {
    return NextResponse.json(
      { error: "business.name is required to start a call" },
      { status: 400 }
    );
  }
  if (!vapiConfigured()) {
    return NextResponse.json(
      {
        error:
          "Vapi is not configured. Set VAPI_API_KEY and VAPI_PHONE_NUMBER_ID for a real call.",
      },
      { status: 400 }
    );
  }
  if (!b?.phone_number) {
    return NextResponse.json(
      { error: "business.phone_number is required for a real call" },
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

  const variables = buildCallVariables(business, scenario);
  try {
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
    return NextResponse.json(
      { error: (err as Error).message, call_id: call.id },
      { status: 502 }
    );
  }
}
