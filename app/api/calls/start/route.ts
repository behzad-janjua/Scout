import { NextResponse } from "next/server";
import {
  createBusiness,
  createScenario,
  createCall,
  createReport,
  updateCall,
} from "@/lib/data";
import { loadDemoBundle } from "@/lib/fixtures";
import { buildCallVariables, startVapiCall, vapiConfigured } from "@/lib/vapi";

// POST /api/calls/start
// Body: { business, scenario, fallback? }
// - fallback: true  -> seed the prebuilt demo bundle (business + scenario +
//   completed call + report) into the store and return its report_id. This is
//   the demo-safe escape hatch: it never touches Vapi/Nebius, so it cannot fail
//   on stage even if the live integrations are down.
// - otherwise        -> create records, then place a live Vapi call (the
//   primary path; the dashboard polls for the transcript and analyzes it).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Demo-safe fallback: rebuild the reference report from fixtures so the
  // dashboard always has a complete, real report to render.
  if (body?.fallback) {
    return seedDemoReport();
  }

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

// Seed the fixture demo bundle into the data store (works against Insforge or
// the in-memory fallback) and return the freshly created report_id, so the
// report page can load it through the normal getReportBundle path.
async function seedDemoReport() {
  const demo = loadDemoBundle();
  if (!demo.business || !demo.scenario || !demo.call || !demo.report) {
    return NextResponse.json(
      { error: "demo fixtures are incomplete" },
      { status: 500 }
    );
  }

  const business = await createBusiness({
    name: demo.business.name,
    business_type: demo.business.business_type,
    phone_number: demo.business.phone_number,
    owner_email: demo.business.owner_email,
    location: demo.business.location,
  });

  const scenario = await createScenario({
    business_id: business.id,
    title: demo.scenario.title,
    description: demo.scenario.description,
    goal: demo.scenario.goal,
    customer_persona: demo.scenario.customer_persona,
    questions_to_ask: demo.scenario.questions_to_ask ?? [],
  });

  const call = await createCall({
    business_id: business.id,
    scenario_id: scenario.id,
    provider: "fixture",
    vapi_call_id: null,
    status: "completed",
    started_at: demo.call.started_at,
    ended_at: demo.call.ended_at,
    duration_seconds: demo.call.duration_seconds,
    recording_url: demo.call.recording_url,
    transcript: demo.call.transcript,
    failure_reason: null,
  });

  // Strip the fixture's own identifiers; the store assigns fresh ones.
  const {
    report_id: _rid,
    call_id: _cid,
    created_at: _cat,
    ...analysis
  } = demo.report;
  const report = await createReport({ ...analysis, call_id: call.id });

  return NextResponse.json(
    {
      mode: "fallback",
      business_id: business.id,
      scenario_id: scenario.id,
      call_id: call.id,
      report_id: report.report_id,
      note: "Loaded the prebuilt demo report (no live call placed).",
    },
    { status: 201 }
  );
}
