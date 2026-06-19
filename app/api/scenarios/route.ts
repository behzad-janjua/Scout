import { NextResponse } from "next/server";
import { createScenario } from "@/lib/data";

// POST /api/scenarios — create a scenario tied to a business.
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

  const scenario = await createScenario({
    business_id: body.business_id,
    title: body.title,
    description: body.description || undefined,
    goal: body.goal ?? "",
    customer_persona: body.customer_persona ?? "",
    questions_to_ask: questions,
  });
  return NextResponse.json(scenario, { status: 201 });
}
