# Scout.ai API Route Contracts

These route contracts map the Scout.ai demo workflow to backend endpoints. They are written for a Next.js-style app, but the request/response shapes can be reused in any framework.

## `POST /api/tests`

Creates the business and scenario before the call starts.

Request:

```json
{
  "business": {
    "name": "Crank & Coast Bike Shop",
    "business_type": "bike_shop",
    "phone_number": "+15550101337",
    "owner_email": "owner@example.com"
  },
  "scenario": {
    "title": "E-bike repair inquiry",
    "description": "Customer asks whether the shop can repair an e-bike with a clicking noise.",
    "goal": "Convert a high-intent repair caller into a repair intake.",
    "customer_persona": "Alex, a local e-bike owner hearing a clicking noise.",
    "questions_to_ask": [
      "Do you repair e-bikes?",
      "Could I bring it in this week?",
      "Do I need an appointment, or should I just stop by?"
    ]
  }
}
```

Response:

```json
{
  "business_id": "uuid",
  "scenario_id": "uuid",
  "status": "created"
}
```

## `POST /api/calls/start`

Starts a real Vapi mystery shopper call.

Request:

```json
{
  "business_id": "uuid",
  "scenario_id": "uuid",
  "mode": "live"
}
```

Response:

```json
{
  "call_id": "uuid",
  "vapi_call_id": "string",
  "status": "queued | ringing | in_progress"
}
```

## `POST /api/calls/webhook`

Receives Vapi call lifecycle updates.

Request:

```json
{
  "vapi_call_id": "string",
  "status": "completed",
  "started_at": "2026-06-19T18:00:00.000Z",
  "ended_at": "2026-06-19T18:02:12.000Z",
  "duration_seconds": 132,
  "recording_url": "https://example.com/recording.mp3",
  "transcript": "Scout.ai: Hi, I was wondering if you repair e-bikes..."
}
```

Response:

```json
{
  "call_id": "uuid",
  "status": "updated"
}
```

## `POST /api/reports/analyze`

Runs Nebius analysis against a saved transcript.

Request:

```json
{
  "call_id": "uuid"
}
```

Response:

```json
{
  "report_id": "uuid",
  "call_id": "uuid",
  "overall_score": 58,
  "score_category": "lost_revenue_risk",
  "outcome": "missed_opportunity"
}
```

## `GET /api/reports/:id`

Returns a complete dashboard-ready report.

Response:

```json
{
  "business": {
    "id": "uuid",
    "name": "Crank & Coast Bike Shop",
    "business_type": "bike_shop",
    "phone_number": "+15550101337"
  },
  "scenario": {
    "id": "uuid",
    "title": "E-bike repair inquiry",
    "goal": "Convert a high-intent repair caller into a repair intake."
  },
  "call": {
    "id": "uuid",
    "status": "completed",
    "duration_seconds": 132,
    "recording_url": "https://example.com/recording.mp3",
    "transcript": "Scout.ai: Hi, I was wondering if you repair e-bikes..."
  },
  "report": {
    "id": "uuid",
    "overall_score": 58,
    "score_category": "lost_revenue_risk",
    "outcome": "missed_opportunity",
    "customer_intent": "high",
    "summary": "The caller showed clear intent...",
    "category_scores": {},
    "what_went_well": [],
    "worst_sentences": [],
    "missed_revenue_moments": [],
    "lead_capture_checklist": {},
    "recommended_staff_script": "Yes, we service most e-bikes...",
    "top_training_priority": "Train staff to turn high-intent repair questions into a specific appointment."
  }
}
```

## Live Demo Rules

- `/api/calls/start` should fail clearly if Vapi credentials or a target phone number are missing.
- Vapi webhook events should update the saved call with status, recording URL, and transcript.
- `/api/reports/analyze` should return `409` until the call transcript is available.
- `/api/reports/analyze` should fail clearly if Nebius credentials are missing or the model returns invalid JSON.
