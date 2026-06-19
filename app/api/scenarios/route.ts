import { NextResponse } from "next/server";
import { createScenario, id } from "@/lib/store";
import type { Scenario } from "@/lib/types";

// POST /api/scenarios — create a scenario tied to a business.
// Phase 2: persist to Insforge instead of the in-memory store.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.business_id || !body?.title) {
    return NextResponse.json(
      { error: "business_id and title are required" },
      { status: 400 }
    );
  }
  const questions = Array.isArray(body.questions_to_ask)
    ? body.questions_to_ask
    : typeof body.questions_to_ask === "string"
      ? body.questions_to_ask.split("\n").map((q: string) => q.trim()).filter(Boolean)
      : [];

  const scenario: Scenario = {
    id: id("scenario"),
    business_id: body.business_id,
    title: body.title,
    description: body.description || undefined,
    goal: body.goal ?? "",
    customer_persona: body.customer_persona ?? "",
    questions_to_ask: questions,
    created_at: new Date().toISOString(),
  };
  createScenario(scenario);
  return NextResponse.json(scenario, { status: 201 });
}
