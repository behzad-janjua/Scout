import { NextResponse } from "next/server";
import { createBusiness, createScenario, createCall, id } from "@/lib/store";
import { loadDemoBundle } from "@/lib/fixtures";
import type { Business, Call, Scenario } from "@/lib/types";

// POST /api/calls/start
// Body: { business, scenario, fallback }
// - fallback: true  -> return the pre-built demo report id (demo-safe path)
// - fallback: false -> create records + a pending call (Phase 3 wires Vapi)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Demo-safe fallback: skip live calling entirely.
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

  const business: Business = createBusiness({
    id: id("biz"),
    name: b.name,
    business_type: b.business_type ?? "other",
    phone_number: b.phone_number ?? "",
    owner_email: b.owner_email || undefined,
    created_at: new Date().toISOString(),
  });

  const scenario: Scenario = createScenario({
    id: id("scenario"),
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
    created_at: new Date().toISOString(),
  });

  // Phase 3 replaces this with a real Vapi outbound call. For now we record a
  // queued call so the rest of the pipeline has something to attach to.
  const call: Call = createCall({
    id: id("call"),
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
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      mode: "live_pending",
      business_id: business.id,
      scenario_id: scenario.id,
      call_id: call.id,
      note: "Vapi integration pending (Phase 3). Use fallback for the demo report.",
    },
    { status: 201 }
  );
}
