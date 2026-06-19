# Scout.ai Data Contracts

This file is the shared contract for Scout.ai prompts, fixtures, backend routes, and dashboard data.

## Core Workflow

```text
Store owner creates a test
        ↓
Insforge saves the business + test scenario
        ↓
Vapi places the mystery shopper call
        ↓
Vapi records/transcribes the call
        ↓
Insforge saves the transcript
        ↓
Nebius analyzes the transcript
        ↓
Insforge saves the score/report
        ↓
Store owner views the dashboard
```

Implementation details live in:

- `/docs/insforge-workflow.md`
- `/docs/insforge-schema.md`
- `/docs/api-routes.md`

## Nebius Analysis Output

The Nebius analysis route should return a JSON object with these fields:

```json
{
  "report_id": "string",
  "call_id": "string",
  "overall_score": 0,
  "score_category": "excellent | good | needs_improvement | lost_revenue_risk",
  "outcome": "converted | partially_converted | missed_opportunity | poor_experience",
  "customer_intent": "low | medium | high",
  "summary": "string",
  "category_scores": {
    "greeting_quality": 0,
    "helpfulness": 0,
    "confidence": 0,
    "lead_capture": 0,
    "conversion_attempt": 0,
    "clear_next_step": 0
  },
  "what_went_well": ["string"],
  "worst_sentences": [
    {
      "exact_sentence": "string",
      "issue": "string",
      "why_it_hurt_conversion": "string",
      "better_response": "string"
    }
  ],
  "missed_revenue_moments": ["string"],
  "lead_capture_checklist": {
    "asked_name": false,
    "asked_phone": false,
    "identified_need": false,
    "confirmed_availability": false,
    "offered_booking": false,
    "gave_clear_next_step": false,
    "asked_for_sale": false
  },
  "recommended_staff_script": "string",
  "top_training_priority": "string"
}
```

## Score Categories

| Score | Category | Owner-facing label |
| --- | --- | --- |
| 90-100 | `excellent` | Excellent |
| 75-89 | `good` | Good |
| 60-74 | `needs_improvement` | Needs improvement |
| 0-59 | `lost_revenue_risk` | Lost revenue risk |

## Vapi Call Metadata

The Vapi webhook should produce this call shape:

```json
{
  "call_id": "string",
  "vapi_call_id": "string",
  "business_id": "string",
  "scenario_id": "string",
  "status": "queued | ringing | in_progress | completed | failed",
  "started_at": "ISO-8601 timestamp",
  "ended_at": "ISO-8601 timestamp or null",
  "duration_seconds": 0,
  "recording_url": "string or null",
  "transcript": "string",
  "failure_reason": "string or null"
}
```

## Demo Scenarios

| ID | Business type | Scenario | Success signal |
| --- | --- | --- | --- |
| `bike_angry_warranty_complaint` | Bike shop | Customer complains about a recent bike purchase | Employee acknowledges frustration, offers an inspection time, and captures name or phone |
| `salon_haircut_appointment` | Salon | Customer asks for a haircut before an event | Employee recommends a stylist/time and books the appointment |
| `restaurant_birthday_reservation` | Restaurant | Customer asks for a Saturday birthday reservation | Employee checks availability, captures party size/name, and confirms reservation details |
