// Nebius transcript analysis for Scout.ai (Phase 4).
//
// analyzeTranscript() loads /prompts/nebius-analysis.md, fills in the business /
// scenario / transcript, sends it to Nebius (OpenAI-compatible chat completions
// API), then parses + validates the structured JSON report.
//
// Live analysis only runs when NEBIUS_API_KEY + NEBIUS_MODEL are set. Callers
// catch errors and fall back to the fixture analysis so the demo never breaks.
import fs from "fs";
import path from "path";
import {
  scoreCategoryFor,
  type Business,
  type Scenario,
  type Report,
  type CategoryScores,
  type LeadCaptureChecklist,
} from "./types";

const PROMPT_PATH = path.join(
  process.cwd(),
  "prompts",
  "nebius-analysis.md"
);

const API_KEY = process.env.NEBIUS_API_KEY;
const BASE_URL = process.env.NEBIUS_BASE_URL ?? "https://api.studio.nebius.com/v1";
const MODEL = process.env.NEBIUS_MODEL;

export function nebiusConfigured(): boolean {
  return Boolean(API_KEY && MODEL);
}

// The analysis fields produced by Nebius. The store assigns report_id and the
// route supplies call_id, so we omit those here.
export type Analysis = Omit<Report, "report_id" | "call_id" | "created_at">;

export interface AnalyzeInput {
  business: Pick<Business, "name" | "business_type">;
  scenario: Pick<Scenario, "title" | "goal">;
  transcript: string;
  // Optional hint; the model still decides the final value in its output.
  customerIntentHint?: string;
}

let _promptCache: string | null = null;
function loadPromptTemplate(): string {
  if (_promptCache == null) {
    _promptCache = fs.readFileSync(PROMPT_PATH, "utf-8");
  }
  return _promptCache;
}

function renderPrompt(input: AnalyzeInput): string {
  const vars: Record<string, string> = {
    business_name: input.business.name,
    business_type: input.business.business_type || "local business",
    scenario_title: input.scenario.title,
    scenario_goal: input.scenario.goal,
    customer_intent: input.customerIntentHint ?? "unknown",
    transcript: input.transcript,
  };
  let out = loadPromptTemplate();
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value);
  }
  return out;
}

// Pull a JSON object out of a model response, tolerating ```json fences or
// surrounding prose even though the prompt asks for raw JSON.
function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall back to the first {...} block.
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Nebius response was not valid JSON");
  }
}

const CATEGORY_KEYS: (keyof CategoryScores)[] = [
  "greeting_quality",
  "helpfulness",
  "confidence",
  "lead_capture",
  "conversion_attempt",
  "clear_next_step",
];

const CHECKLIST_KEYS: (keyof LeadCaptureChecklist)[] = [
  "asked_name",
  "asked_phone",
  "identified_need",
  "confirmed_availability",
  "offered_booking",
  "gave_clear_next_step",
  "asked_for_sale",
];

const OUTCOMES = [
  "converted",
  "partially_converted",
  "missed_opportunity",
  "poor_experience",
];

// Validate + coerce the raw model output into a well-formed Analysis. Throws
// with a clear message when a required field is missing or the wrong type, so
// the route can fall back to the fixture report.
export function validateAnalysis(raw: unknown): Analysis {
  if (!raw || typeof raw !== "object") {
    throw new Error("analysis is not an object");
  }
  const r = raw as Record<string, unknown>;

  const score = Number(r.overall_score);
  if (!Number.isFinite(score)) {
    throw new Error("overall_score is missing or not a number");
  }
  const overall_score = Math.max(0, Math.min(100, Math.round(score)));

  if (typeof r.summary !== "string" || !r.summary.trim()) {
    throw new Error("summary is missing");
  }

  // Coerce the model-driven enums to safe defaults instead of hard-failing the
  // whole report: a short or ambiguous call legitimately yields "unknown", and
  // the live path has no fixture fallback, so a single off-vocabulary value must
  // not block an otherwise-complete report.
  const outcomeRaw = String(r.outcome).toLowerCase();
  const outcome = OUTCOMES.includes(outcomeRaw) ? outcomeRaw : "missed_opportunity";

  const intentRaw = String(r.customer_intent).toLowerCase();
  const intent = ["low", "medium", "high"].includes(intentRaw)
    ? intentRaw
    : "medium";

  const cs = r.category_scores as Record<string, unknown> | undefined;
  if (!cs || typeof cs !== "object") {
    throw new Error("category_scores is missing");
  }
  const category_scores = {} as CategoryScores;
  for (const k of CATEGORY_KEYS) {
    const v = Number(cs[k]);
    if (!Number.isFinite(v)) throw new Error(`category_scores.${k} is missing`);
    category_scores[k] = Math.max(0, Math.min(100, Math.round(v)));
  }

  const lc = r.lead_capture_checklist as Record<string, unknown> | undefined;
  if (!lc || typeof lc !== "object") {
    throw new Error("lead_capture_checklist is missing");
  }
  const lead_capture_checklist = {} as LeadCaptureChecklist;
  for (const k of CHECKLIST_KEYS) {
    lead_capture_checklist[k] = Boolean(lc[k]);
  }

  const asStringArray = (value: unknown, field: string): string[] => {
    if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
    return value.map((x) => String(x));
  };

  if (!Array.isArray(r.worst_sentences)) {
    throw new Error("worst_sentences must be an array");
  }
  const worst_sentences = (r.worst_sentences as Record<string, unknown>[]).map(
    (w, i) => {
      if (!w || typeof w !== "object") {
        throw new Error(`worst_sentences[${i}] is not an object`);
      }
      if (typeof w.exact_sentence !== "string") {
        throw new Error(`worst_sentences[${i}].exact_sentence is missing`);
      }
      return {
        exact_sentence: String(w.exact_sentence),
        issue: String(w.issue ?? ""),
        why_it_hurt_conversion: String(w.why_it_hurt_conversion ?? ""),
        better_response: String(w.better_response ?? ""),
      };
    }
  );

  if (typeof r.recommended_staff_script !== "string") {
    throw new Error("recommended_staff_script is missing");
  }
  if (typeof r.top_training_priority !== "string") {
    throw new Error("top_training_priority is missing");
  }

  // Trust the model's category, but keep it consistent with the numeric score.
  const score_category = scoreCategoryFor(overall_score);

  return {
    overall_score,
    score_category,
    outcome: outcome as Analysis["outcome"],
    customer_intent: intent as Analysis["customer_intent"],
    summary: r.summary,
    category_scores,
    what_went_well: asStringArray(r.what_went_well ?? [], "what_went_well"),
    worst_sentences,
    missed_revenue_moments: asStringArray(
      r.missed_revenue_moments ?? [],
      "missed_revenue_moments"
    ),
    lead_capture_checklist,
    recommended_staff_script: r.recommended_staff_script,
    top_training_priority: r.top_training_priority,
  };
}

// Send business type, scenario, and transcript to Nebius and return a validated
// structured analysis. Throws on misconfiguration, API error, or bad output.
export async function analyzeTranscript(input: AnalyzeInput): Promise<Analysis> {
  if (!nebiusConfigured()) {
    throw new Error("Nebius is not configured (missing NEBIUS_API_KEY/model)");
  }
  if (!input.transcript.trim()) {
    throw new Error("transcript is empty — nothing to analyze");
  }

  const prompt = renderPrompt(input);

  const res = await fetch(`${BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Scout.ai, a phone sales auditor. Respond with a single valid JSON object only — no markdown, no prose.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      (data as { error?: { message?: string }; message?: string })?.error
        ?.message ??
      (data as { message?: string })?.message ??
      `HTTP ${res.status}`;
    throw new Error(`Nebius request failed: ${detail}`);
  }

  const content: string | undefined = (
    data as { choices?: { message?: { content?: string } }[] }
  )?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Nebius response had no content");
  }

  return validateAnalysis(extractJson(content));
}
