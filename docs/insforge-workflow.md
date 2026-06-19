# Scout.ai Insforge Workflow

This is the backend flow for the core Scout.ai demo path.

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

## Step 1: Store Owner Creates A Test

The owner submits:

- business name
- business type
- phone number
- owner email, optional
- scenario title
- scenario goal
- customer persona
- questions to ask

Backend route:

```text
POST /api/tests
```

Backend behavior:

1. Create a `businesses` row.
2. Create a `scenarios` row linked to the business.
3. Return `business_id`, `scenario_id`, and a ready-to-start test object.

## Step 2: Insforge Saves Business + Scenario

The app should persist the owner input before calling Vapi. This makes the test recoverable if the call fails.

Tables written:

- `businesses`
- `scenarios`

Expected response shape:

```json
{
  "business_id": "uuid",
  "scenario_id": "uuid",
  "status": "created"
}
```

## Step 3: Vapi Places The Call

Backend route:

```text
POST /api/calls/start
```

Request body:

```json
{
  "business_id": "uuid",
  "scenario_id": "uuid"
}
```

Backend behavior:

1. Load the business and scenario from Insforge.
2. Create a `calls` row with status `queued`.
3. Send business/scenario details to Vapi.
4. Update the `calls` row with `vapi_call_id` and status from Vapi.
5. Return the local `call_id`.

Live demo behavior:

If Vapi is unavailable during the demo, fail clearly before analysis. Do not substitute a transcript on the primary demo path.

## Step 4: Vapi Records And Transcribes The Call

Vapi sends call events to:

```text
POST /api/calls/webhook
```

The webhook should accept:

- Vapi call ID
- call status
- recording URL
- transcript
- start/end timestamps
- duration
- failure reason, optional

The app should be able to handle partial events. For example, a status update may arrive before the transcript is ready.

## Step 5: Insforge Saves The Transcript

When the transcript is available, update the existing `calls` row:

- `status`
- `started_at`
- `ended_at`
- `duration_seconds`
- `recording_url`
- `transcript`
- `failure_reason`

The transcript should be saved as plain text in the `calls.transcript` field so it can be sent directly to Nebius and displayed in the dashboard.

## Step 6: Nebius Analyzes The Transcript

Backend route:

```text
POST /api/reports/analyze
```

Request body:

```json
{
  "call_id": "uuid"
}
```

Backend behavior:

1. Load the call, scenario, and business from Insforge.
2. Send `business_type`, `scenario`, and `transcript` to Nebius using `/prompts/nebius-analysis.md`.
3. Parse the structured JSON response.
4. Validate required fields against `/docs/data-contracts.md`.
5. Write a `reports` row.
6. Return the report.

Live demo behavior:

If Nebius is unavailable or returns invalid JSON, surface the error so the team can fix credentials, model configuration, or prompt output before presenting.

## Step 7: Insforge Saves The Score/Report

The report should save both queryable fields and structured JSON:

- queryable fields: `overall_score`, `score_category`, `outcome`, `customer_intent`, `summary`
- structured fields: `category_scores`, `what_went_well`, `worst_sentences`, `missed_revenue_moments`, `lead_capture_checklist`
- script fields: `recommended_staff_script`, `top_training_priority`

This keeps the dashboard simple while preserving the full Nebius output.

## Step 8: Store Owner Views The Dashboard

Dashboard route:

```text
GET /api/reports/:id
```

Backend behavior:

1. Load the report.
2. Join the related call, scenario, and business.
3. Return one dashboard-ready object.

The frontend should not need to make separate requests for business, scenario, transcript, and report data during the demo.

## Demo Success Criteria

The flow is demo-ready when:

- a test can be created
- business and scenario data are stored
- a Vapi call can be started or simulated
- a transcript is stored
- Nebius analysis can run or fall back to fixture JSON
- a report is stored
- the dashboard can load one complete report object
