// Vapi integration for Scout.ai (Phase 3).
//
// Responsibilities:
//   1. Build the mystery-shopper assistant config from /prompts and the
//      business + scenario the owner entered.
//   2. Place an outbound call via the Vapi REST API.
//   3. Normalize inbound webhook events into our Call shape.
//   4. Verify the webhook shared secret.
//
// Live calling only happens when VAPI_API_KEY + VAPI_PHONE_NUMBER_ID are set.
import fs from "fs";
import path from "path";
import type { Business, Scenario, CallStatus } from "./types";

const VAPI_API_BASE = "https://api.vapi.ai";
const PROMPT_PATH = path.join(
  process.cwd(),
  "prompts",
  "vapi-mystery-shopper.md"
);

// Number the shopper hands out when an employee asks for a callback number.
const DEMO_CUSTOMER_PHONE =
  process.env.VAPI_DEMO_CUSTOMER_PHONE ?? "+15555550123";

const API_KEY = process.env.VAPI_API_KEY;
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
const WEBHOOK_URL = process.env.VAPI_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET;

// A live outbound call needs an API key, a Vapi phone number to dial from, and
// a real destination number on the business record (set per call).
export function vapiConfigured(): boolean {
  return Boolean(API_KEY && PHONE_NUMBER_ID);
}

// --- Assistant / variable building ----------------------------------------

export interface CallVariables {
  business_name: string;
  business_type: string;
  scenario_title: string;
  customer_persona: string;
  goal_of_call: string;
  questions_to_ask: string;
  demo_customer_phone: string;
}

export function buildCallVariables(
  business: Pick<Business, "name" | "business_type">,
  scenario: Pick<
    Scenario,
    "title" | "customer_persona" | "goal" | "questions_to_ask"
  >
): CallVariables {
  const questions = (scenario.questions_to_ask ?? [])
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");
  return {
    business_name: business.name,
    business_type: business.business_type || "local business",
    scenario_title: scenario.title,
    customer_persona: scenario.customer_persona || "A realistic local customer",
    goal_of_call: scenario.goal,
    questions_to_ask: questions || "Ask about availability and next steps.",
    demo_customer_phone: DEMO_CUSTOMER_PHONE,
  };
}

let _promptCache: string | null = null;
function loadPromptTemplate(): string {
  if (_promptCache == null) {
    _promptCache = fs.readFileSync(PROMPT_PATH, "utf-8");
  }
  return _promptCache;
}

// Fill {{var}} template values in the prompt with concrete values. Used when we
// build a transient assistant inline (no pre-configured VAPI_ASSISTANT_ID).
export function renderSystemPrompt(vars: CallVariables): string {
  let out = loadPromptTemplate();
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value);
  }
  return out;
}

// A self-contained assistant definition for when no assistant is pre-created in
// the Vapi dashboard. Kept minimal but realistic (sane voice/model defaults).
function buildInlineAssistant(vars: CallVariables) {
  return {
    // Vapi caps assistant.name at 40 chars, so keep the prefix short and slice.
    name: `Scout.ai — ${vars.business_name}`.slice(0, 40),
    // The shopper must open the call. "assistant-speaks-first" requires a static
    // firstMessage (empty here -> dead air -> silence-timed-out), so we let the
    // model generate the opener from the system prompt's "customer-style opening".
    firstMessageMode: "assistant-speaks-first-with-model-generated-message",
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: renderSystemPrompt(vars) }],
    },
    voice: { provider: "vapi", voiceId: "Elliot" },
    transcriber: { provider: "deepgram", model: "nova-2" },
    // Capture artifacts so the webhook gets a recording + final transcript.
    artifactPlan: { recordingEnabled: true },
  };
}

// --- Outbound call ----------------------------------------------------------

export interface StartCallInput {
  destinationNumber: string;
  variables: CallVariables;
}

export interface StartCallResult {
  vapiCallId: string;
  status: CallStatus;
  raw: unknown;
}

// Place an outbound Vapi call. Throws on misconfiguration or a non-2xx Vapi
// response so the caller can fall back to the simulated transcript path.
export async function startVapiCall(
  input: StartCallInput
): Promise<StartCallResult> {
  if (!vapiConfigured()) {
    throw new Error("Vapi is not configured (missing VAPI_API_KEY/phone id)");
  }
  if (!input.destinationNumber) {
    throw new Error("Business phone_number is required to place a live call");
  }

  // Per-call webhook config so we don't depend on dashboard settings.
  const server = WEBHOOK_URL
    ? { url: WEBHOOK_URL, ...(WEBHOOK_SECRET ? { secret: WEBHOOK_SECRET } : {}) }
    : undefined;

  const body: Record<string, unknown> = {
    phoneNumberId: PHONE_NUMBER_ID,
    customer: { number: input.destinationNumber },
  };

  if (ASSISTANT_ID) {
    // Reuse the dashboard assistant; inject this call's business/scenario via
    // template variables and attach our webhook.
    body.assistantId = ASSISTANT_ID;
    body.assistantOverrides = {
      variableValues: input.variables,
      ...(server ? { server } : {}),
    };
  } else {
    // No pre-built assistant: define one inline for this call.
    body.assistant = buildInlineAssistant(input.variables);
    if (server) body.assistantOverrides = { server };
  }

  const res = await fetch(`${VAPI_API_BASE}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      (data as { message?: string })?.message ?? `HTTP ${res.status}`;
    throw new Error(`Vapi call failed: ${detail}`);
  }

  // Vapi may return a single call object or an array (batch). Take the first.
  const call = Array.isArray(data) ? data[0] : data;
  const vapiCallId = (call as { id?: string })?.id;
  if (!vapiCallId) {
    throw new Error("Vapi response did not include a call id");
  }

  return {
    vapiCallId,
    status: mapVapiStatus((call as { status?: string })?.status) ?? "queued",
    raw: data,
  };
}

// --- Webhook handling -------------------------------------------------------

// Vapi sends its shared secret in the `x-vapi-secret` header. If we configured
// a secret, require it to match; if we didn't, accept (demo-friendly).
export function verifyWebhookSecret(headers: Headers): boolean {
  if (!WEBHOOK_SECRET) return true;
  const provided =
    headers.get("x-vapi-secret") ?? headers.get("x-vapi-signature");
  return provided === WEBHOOK_SECRET;
}

// Map Vapi's hyphenated status vocabulary to our CallStatus enum.
export function mapVapiStatus(status?: string): CallStatus | null {
  switch (status) {
    case "queued":
      return "queued";
    case "ringing":
      return "ringing";
    case "in-progress":
      return "in_progress";
    case "forwarding":
      return "in_progress";
    case "ended":
      return "completed";
    default:
      return null;
  }
}

export interface NormalizedCallEvent {
  vapiCallId: string | null;
  type: string;
  // Fields are only present when the event carries them.
  status?: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  recordingUrl?: string | null;
  transcript?: string;
  failureReason?: string | null;
  isTerminal: boolean;
}

function durationFrom(
  msg: Record<string, unknown>,
  startedAt?: string,
  endedAt?: string
): number | undefined {
  const direct = msg.durationSeconds ?? msg.duration;
  if (typeof direct === "number") return Math.round(direct);
  if (startedAt && endedAt) {
    const secs = (Date.parse(endedAt) - Date.parse(startedAt)) / 1000;
    if (Number.isFinite(secs) && secs >= 0) return Math.round(secs);
  }
  return undefined;
}

// Pull the useful bits out of a raw Vapi webhook body, tolerant of the several
// shapes Vapi uses (status-update, end-of-call-report, transcript, …).
export function normalizeWebhook(body: unknown): NormalizedCallEvent {
  const root = (body ?? {}) as Record<string, unknown>;
  const msg = (root.message ?? root) as Record<string, unknown>;
  const call = (msg.call ?? {}) as Record<string, unknown>;
  const artifact = (msg.artifact ?? {}) as Record<string, unknown>;

  const type = (msg.type as string) ?? "unknown";
  const vapiCallId =
    (call.id as string) ??
    (msg.callId as string) ??
    (root.vapi_call_id as string) ??
    null;

  const startedAt = (msg.startedAt as string) ?? undefined;
  const endedAt = (msg.endedAt as string) ?? undefined;

  const recordingUrl =
    (msg.recordingUrl as string) ??
    (artifact.recordingUrl as string) ??
    ((artifact.recording as { url?: string })?.url ?? undefined) ??
    undefined;

  const transcript =
    (artifact.transcript as string) ?? (msg.transcript as string) ?? undefined;

  const endedReason = (msg.endedReason as string) ?? undefined;
  const isEndReport = type === "end-of-call-report";
  const statusStr = (msg.status as string) ?? (isEndReport ? "ended" : undefined);
  const mapped = mapVapiStatus(statusStr) ?? undefined;

  // Treat a non-customer-driven end reason as a failure for demo debugging.
  const failed =
    isEndReport &&
    typeof endedReason === "string" &&
    /error|failed|no-answer|busy|voicemail|pipeline|unknown/i.test(endedReason);

  return {
    vapiCallId,
    type,
    status: failed ? "failed" : mapped,
    startedAt,
    endedAt,
    durationSeconds: durationFrom(msg, startedAt, endedAt),
    recordingUrl: recordingUrl ?? undefined,
    transcript,
    failureReason: failed ? endedReason ?? "call_failed" : undefined,
    isTerminal: isEndReport || statusStr === "ended",
  };
}
