// Shared Scout.ai types — mirrors /docs/data-contracts.md (Person B owns the contract).
// Keep this file in sync with that doc; it is the single source of truth for shapes.

export type ScoreCategory =
  | "excellent"
  | "good"
  | "needs_improvement"
  | "lost_revenue_risk";

export type Outcome =
  | "converted"
  | "partially_converted"
  | "missed_opportunity"
  | "poor_experience";

export type CustomerIntent = "low" | "medium" | "high";

export type CallStatus =
  | "queued"
  | "ringing"
  | "in_progress"
  | "completed"
  | "failed";

// --- Database records (see IDEA.md "Suggested Data Model") ---

export interface Business {
  id: string;
  name: string;
  business_type: string;
  phone_number: string;
  owner_email?: string;
  location?: string;
  created_at?: string;
}

export interface Scenario {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  goal: string;
  customer_persona: string;
  questions_to_ask?: string[];
  created_at?: string;
}

export interface Call {
  id: string;
  business_id: string;
  scenario_id: string;
  provider?: string;
  vapi_call_id: string | null;
  status: CallStatus;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  recording_url: string | null;
  transcript: string;
  failure_reason?: string | null;
  created_at?: string;
}

// --- Nebius analysis output (see data-contracts.md "Nebius Analysis Output") ---

export interface WorstSentence {
  exact_sentence: string;
  issue: string;
  why_it_hurt_conversion: string;
  better_response: string;
}

export interface CategoryScores {
  greeting_quality: number;
  helpfulness: number;
  confidence: number;
  lead_capture: number;
  conversion_attempt: number;
  clear_next_step: number;
}

export interface LeadCaptureChecklist {
  asked_name: boolean;
  asked_phone: boolean;
  identified_need: boolean;
  confirmed_availability: boolean;
  offered_booking: boolean;
  gave_clear_next_step: boolean;
  asked_for_sale: boolean;
}

export interface Report {
  report_id: string;
  call_id: string;
  overall_score: number;
  score_category: ScoreCategory;
  outcome: Outcome;
  customer_intent: CustomerIntent;
  summary: string;
  category_scores: CategoryScores;
  what_went_well: string[];
  worst_sentences: WorstSentence[];
  missed_revenue_moments: string[];
  lead_capture_checklist: LeadCaptureChecklist;
  recommended_staff_script: string;
  top_training_priority: string;
  created_at?: string;
}

// Combined payload returned by GET /api/reports/:id
export interface ReportBundle {
  business: Business | null;
  scenario: Scenario | null;
  call: Call | null;
  report: Report | null;
}

// --- Helpers ---

export function scoreCategoryFor(score: number): ScoreCategory {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "needs_improvement";
  return "lost_revenue_risk";
}

export const SCORE_CATEGORY_LABEL: Record<ScoreCategory, string> = {
  excellent: "Excellent",
  good: "Good",
  needs_improvement: "Needs improvement",
  lost_revenue_risk: "Lost revenue risk",
};
