import type { LeadCaptureChecklist, ScoreCategory } from "./types";

export const DASHBOARD_COPY = {
  headings: {
    reportOverview: "Report overview",
    callTranscript: "Call transcript",
    worstSentences: "Worst sentences",
    missedRevenueMoments: "Missed revenue moments",
    leadCaptureChecklist: "Lead capture checklist",
    recommendedStaffScript: "Recommended staff script",
    trainingPriority: "Training priority",
  },
  emptyStates: {
    callSummary:
      "Call summary will appear here once a test has run, including business, scenario, date, duration, outcome, and score.",
    transcript:
      "The full call transcript will appear here after Scout.ai finishes the mystery call. Sentences that hurt conversion are highlighted.",
    checklist:
      "A checklist of the key lead-capture moments will appear here after analysis.",
    recommendedScript:
      "A ready-to-use script your staff can say on the next call will appear here.",
    worstSentences:
      "No major conversion issues were found in this call.",
    recording: "Recording is unavailable for this demo call.",
  },
  loadingStates: {
    startingCall: "Starting mystery call...",
    waitingForTranscript: "Waiting for transcript...",
    analyzing: "Analyzing call for missed revenue moments...",
    loadingReport: "Loading Scout.ai report...",
  },
  scoreLabels: {
    excellent:
      "This call was handled well and gave the customer a clear path forward.",
    good: "This call was mostly solid, with a few coaching opportunities.",
    needs_improvement:
      "The employee helped, but missed important conversion steps.",
    lost_revenue_risk:
      "This call likely lost or weakened a high-intent customer.",
  } satisfies Record<ScoreCategory, string>,
  checklistLabels: {
    asked_name: "Asked for name",
    asked_phone: "Asked for phone number",
    identified_need: "Identified customer need",
    confirmed_availability: "Confirmed availability",
    offered_booking: "Offered booking",
    gave_clear_next_step: "Gave clear next step",
    asked_for_sale: "Asked for the sale",
  } satisfies Record<keyof LeadCaptureChecklist, string>,
};
