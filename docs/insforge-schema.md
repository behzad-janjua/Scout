# Scout.ai Insforge Schema

This schema is platform-neutral so it can be implemented through Insforge tables, SQL migrations, or generated API resources depending on the hackathon setup.

## `businesses`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `name` | text | yes | Business name |
| `business_type` | text | yes | Example: `bike_shop`, `salon`, `restaurant` |
| `phone_number` | text | yes | Number Vapi should call |
| `owner_email` | text | no | Optional owner contact |
| `created_at` | timestamp | yes | Default now |
| `updated_at` | timestamp | yes | Default now |

## `scenarios`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `business_id` | uuid | yes | Foreign key to `businesses.id` |
| `title` | text | yes | Scenario name |
| `description` | text | no | Customer-facing situation |
| `goal` | text | yes | Conversion behavior being tested |
| `customer_persona` | text | yes | Persona passed to Vapi |
| `questions_to_ask` | json | yes | Ordered list of shopper questions |
| `success_criteria` | json | no | What a good employee response includes |
| `created_at` | timestamp | yes | Default now |
| `updated_at` | timestamp | yes | Default now |

## `calls`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `business_id` | uuid | yes | Foreign key to `businesses.id` |
| `scenario_id` | uuid | yes | Foreign key to `scenarios.id` |
| `provider` | text | yes | `vapi` or `fallback` |
| `vapi_call_id` | text | no | External Vapi call ID |
| `status` | text | yes | `queued`, `ringing`, `in_progress`, `completed`, `failed`, `fallback_simulated` |
| `started_at` | timestamp | no | From Vapi or app |
| `ended_at` | timestamp | no | From Vapi or app |
| `duration_seconds` | integer | no | Call duration |
| `recording_url` | text | no | Vapi recording URL |
| `transcript` | text | no | Full call transcript |
| `failure_reason` | text | no | Useful for demo debugging |
| `created_at` | timestamp | yes | Default now |
| `updated_at` | timestamp | yes | Default now |

## `reports`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `call_id` | uuid | yes | Foreign key to `calls.id` |
| `analysis_source` | text | yes | `nebius` or `fallback_fixture` |
| `overall_score` | integer | yes | 0-100 |
| `score_category` | text | yes | `excellent`, `good`, `needs_improvement`, `lost_revenue_risk` |
| `outcome` | text | yes | `converted`, `partially_converted`, `missed_opportunity`, `poor_experience` |
| `customer_intent` | text | yes | `low`, `medium`, `high` |
| `summary` | text | yes | Owner-friendly summary |
| `category_scores` | json | yes | Category score object |
| `what_went_well` | json | yes | List of positives |
| `worst_sentences` | json | yes | Sentence-level coaching |
| `missed_revenue_moments` | json | yes | List of missed conversion moments |
| `lead_capture_checklist` | json | yes | Boolean checklist |
| `recommended_staff_script` | text | yes | Suggested replacement script |
| `top_training_priority` | text | yes | Main coaching takeaway |
| `created_at` | timestamp | yes | Default now |
| `updated_at` | timestamp | yes | Default now |

## Relationships

```text
businesses.id
  └── scenarios.business_id
  └── calls.business_id

scenarios.id
  └── calls.scenario_id

calls.id
  └── reports.call_id
```

## Useful Indexes

- `scenarios.business_id`
- `calls.business_id`
- `calls.scenario_id`
- `calls.vapi_call_id`
- `calls.status`
- `reports.call_id`
- `reports.overall_score`
- `reports.outcome`

## Validation Rules

- `overall_score` must be between 0 and 100.
- `score_category` should be derived from `overall_score`.
- A report cannot be created unless the call has a transcript.
- A dashboard response should include one business, one scenario, one call, and one report.
