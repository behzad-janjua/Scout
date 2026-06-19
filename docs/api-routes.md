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
    "title": "Angry recent-purchase complaint",
    "description": "Customer bought a bike two weeks ago and is upset that the rear tire keeps going flat.",
    "goal": "See whether staff de-escalate the customer, take ownership, and create a clear inspection or warranty next step.",
    "customer_persona": "Alex, a recent bike buyer who feels let down before a weekend event.",
    "questions_to_ask": [
      "What are you going to do about the flat tire?",
      "Am I going to have to pay for this?",
      "Can someone actually look at it tomorrow?"
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
  "transcript": "Scout.ai: I bought a bike from you two weeks ago and the rear tire keeps going flat..."
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
    "title": "Angry recent-purchase complaint",
    "goal": "See whether staff de-escalate the customer and create a clear inspection or warranty next step."
  },
  "call": {
    "id": "uuid",
    "status": "completed",
    "duration_seconds": 132,
    "recording_url": "https://example.com/recording.mp3",
    "transcript": "Scout.ai: I bought a bike from you two weeks ago and the rear tire keeps going flat..."
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
    "recommended_staff_script": "I'm sorry the tire is still going flat...",
    "top_training_priority": "Train staff to de-escalate complaints, offer a specific inspection time, and capture contact details."
  }
}
```

## Live Demo Rules

- `/api/calls/start` should fail clearly if Vapi credentials or a target phone number are missing.
- Vapi webhook events should update the saved call with status, recording URL, and transcript.
- `/api/reports/analyze` should return `409` until the call transcript is available.
- `/api/reports/analyze` should fail clearly if Nebius credentials are missing or the model returns invalid JSON.
