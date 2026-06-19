# Scout.ai Two-Person Hackathon Task Split

## Goal

Build Scout.ai with two people working in parallel without stepping on each other. One teammate owns the heavier coding work and initial project setup. The other teammate owns prompts, product logic, test data, dashboard copy, demo flow, and lightweight UI/content work.

## Recommended Ownership

- **Person A — Core Builder / Claude Max**: owns repo setup, app skeleton, database schema, API routes, Vapi/Nebius/Insforge integrations, data flow, and deployment.
- **Person B — Product + AI + Demo / Pro**: owns product definitions, prompts, analysis schema, sample transcripts, demo scenarios, sales copy, report copy, QA, and judge-facing pitch.

This split reduces conflicts because Person A mainly edits application code and backend files, while Person B mainly edits content, prompts, fixtures, config examples, and demo materials.

---

## Workstream Boundaries

### Person A Owns Code-Heavy Areas

Person A should create and own these files/folders:

```text
/app
/components
/lib
/api
/db
/integrations
/package.json
.env.example
README.md setup sections
```

Main responsibility: make the product work end-to-end.

### Person B Owns Product, Prompt, and Demo Areas

Person B should create and own these files/folders:

```text
/prompts
/fixtures
/demo
/docs
/content
README.md demo/pitch sections only
```

Main responsibility: make the product clear, impressive, and demo-ready.

---

## Parallel Task Plan

## Phase 1 — First 45 Minutes: Setup Without Conflicts

### Person A: Initialize the App

Tasks:

1. Create the repo/app.
2. Set up frontend framework.
3. Set up environment variables.
4. Create basic routes/pages:
   - home page
   - create test page
   - call report page
5. Add placeholder UI sections:
   - business form
   - scenario form
   - transcript panel
   - score panel
   - worst sentences panel
   - checklist panel
6. Create basic API route stubs:
   - `POST /api/businesses`
   - `POST /api/scenarios`
   - `POST /api/calls/start`
   - `POST /api/calls/webhook`
   - `POST /api/reports/analyze`
   - `GET /api/reports/:id`

Deliverable:

- Running app with placeholder pages and empty API routes.

### Person B: Define Product and AI Inputs

Tasks:

1. Create `/prompts/nebius-analysis.md`.
2. Create `/prompts/vapi-mystery-shopper.md`.
3. Create `/fixtures/sample-transcript-bike-shop.txt`.
4. Create `/fixtures/sample-analysis-output.json`.
5. Create `/docs/demo-script.md`.
6. Create `/docs/judging-pitch.md`.
7. Define 3 demo scenarios:
   - bike shop e-bike repair
   - salon haircut appointment
   - restaurant reservation

Deliverable:

- Complete prompts, sample transcript, expected JSON output, and demo story.

---

## Phase 2 — Backend and Data Model

### Person A: Build Insforge Backend

Tasks:

1. Create database tables:
   - `businesses`
   - `scenarios`
   - `calls`
   - `reports`
2. Add create/read functions for each table.
3. Wire the business/scenario form to create database records.
4. Store sample transcript in the `calls` table.
5. Store sample analysis in the `reports` table.
6. Build `GET /api/reports/:id` to return call + report data.

Deliverable:

- Database can store and retrieve the full Scout.ai workflow.

### Person B: Prepare Data Contracts

Tasks:

1. Define exact JSON schema for Nebius output.
2. Define exact Vapi call metadata format.
3. Create clean sample records for:
   - one business
   - one scenario
   - one call
   - one report
4. Write labels and helper text for the dashboard.
5. Decide score categories:
   - 90–100: excellent
   - 75–89: good
   - 60–74: needs improvement
   - below 60: lost revenue risk

Deliverable:

- Person A has stable sample data and schemas to code against.

---

## Phase 3 — Vapi Integration

### Person A: Wire Vapi Call Flow

Tasks:

1. Create Vapi assistant or call configuration.
2. Send business/scenario info into Vapi.
3. Trigger a call from `POST /api/calls/start`.
4. Receive call events through webhook.
5. Save call status, duration, transcript, and recording URL.
6. Add fallback mode using the sample transcript if live call fails.

Deliverable:

- The app can trigger or simulate a mystery shopper call and save transcript data.

### Person B: Finalize Vapi Agent Behavior

Tasks:

1. Refine the mystery shopper system prompt.
2. Create scenario-specific question lists.
3. Create tone rules:
   - polite
   - realistic
   - brief
   - not robotic
   - asks one question at a time
4. Create ending rules:
   - end when employee gives a clear next step
   - end if employee refuses
   - end after enough data is collected
5. Test transcripts manually and flag unrealistic language.

Deliverable:

- Vapi agent sounds like a realistic customer, not an auditor.

---

## Phase 4 — Nebius Transcript Analysis

### Person A: Implement Nebius API Call

Tasks:

1. Create `analyzeTranscript()` function.
2. Load prompt from `/prompts/nebius-analysis.md`.
3. Send business type, scenario, and transcript to Nebius.
4. Parse structured JSON response.
5. Validate required fields exist.
6. Store report in Insforge.
7. Return report to frontend.

Deliverable:

- Transcript turns into a structured report automatically.

### Person B: Improve the Analysis Quality

Tasks:

1. Make the Nebius prompt stricter about exact sentence extraction.
2. Add examples of good and bad outputs.
3. Add analysis categories:
   - greeting quality
   - helpfulness
   - confidence
   - lead capture
   - conversion attempt
   - clear next step
4. Create backup report JSON in case API output breaks.
5. Check that the report is owner-friendly and not too technical.

Deliverable:

- The analysis feels valuable and actionable to a store owner.

---

## Phase 5 — Dashboard

### Person A: Build Dashboard Components

Tasks:

1. Build call summary card.
2. Build transcript viewer.
3. Build worst sentences component.
4. Build lead capture checklist.
5. Build recommended script component.
6. Build score badge.
7. Connect all sections to real report data.

Deliverable:

- Working dashboard that displays a saved Scout.ai report.

### Person B: Polish Report Content and Demo Copy

Tasks:

1. Write store-owner-friendly headings.
2. Write empty states and loading states.
3. Create the final report example text.
4. Decide which worst sentences should be highlighted in the demo.
5. Create before/after sentence examples.
6. Prepare final pitch wording.

Deliverable:

- Dashboard reads like a product, not a raw technical demo.

---

## Phase 6 — Demo Prep

### Person A: Technical Demo Path

Tasks:

1. Confirm app runs from a clean start.
2. Confirm database records are created.
3. Confirm transcript is saved.
4. Confirm Nebius analysis works.
5. Confirm dashboard loads final report.
6. Add a one-click fallback demo button:
   - load sample transcript
   - run analysis or load backup JSON
   - show final report

Deliverable:

- Demo cannot fail even if live calling or API calls break.

### Person B: Judge Story and Sales Pitch

Tasks:

1. Write 3-minute demo script.
2. Write 30-second problem pitch.
3. Write 30-second sponsor integration explanation.
4. Write final closing line.
5. Prepare answers to judge questions:
   - Why would a store owner pay?
   - How often would Scout.ai call?
   - Is this ethical?
   - What makes this multimodal?
   - How does each sponsor fit?

Deliverable:

- Team can pitch clearly and confidently.

---

# Suggested Git Workflow

## Branches

Person A:

```text
main
feature/app-backend
feature/integrations
feature/dashboard
```

Person B:

```text
feature/prompts-fixtures
feature/demo-docs
feature/report-copy
```

## Merge Rules

1. Person A merges code-heavy branches.
2. Person B merges content/prompt branches.
3. Avoid both people editing the same file at the same time.
4. Keep shared contracts in one file:
   - `/docs/data-contracts.md`
5. Once a schema changes, Person B updates the example JSON before Person A wires it into UI.

---

# File Ownership Map

| Area | Owner | Files |
|---|---|---|
| App setup | Person A | `package.json`, app config, env setup |
| Database | Person A | `/db`, Insforge setup, API routes |
| Vapi integration | Person A | `/integrations/vapi`, call start/webhook routes |
| Nebius integration | Person A | `/integrations/nebius`, analysis route |
| Dashboard components | Person A | `/components`, report page |
| Vapi prompt | Person B | `/prompts/vapi-mystery-shopper.md` |
| Nebius prompt | Person B | `/prompts/nebius-analysis.md` |
| Sample transcripts | Person B | `/fixtures/*.txt` |
| Sample JSON reports | Person B | `/fixtures/*.json` |
| Demo script | Person B | `/docs/demo-script.md` |
| Pitch | Person B | `/docs/judging-pitch.md` |
| Dashboard copy | Person B | `/content/dashboard-copy.md` |

---

# Priority Order

## Must Finish First

1. App shell
2. Insforge data model
3. Sample transcript storage
4. Nebius transcript analysis
5. Dashboard report display
6. Demo fallback path

## Then Add

1. Real Vapi outbound call
2. Vapi webhook transcript capture
3. Multiple scenarios
4. Highlighted transcript snippets
5. Better visual polish

## Only If Time Allows

1. Weekly scheduling plan
2. Trend chart over time
3. Estimated lost revenue
4. Email report
5. Multi-location dashboard

---

# Best MVP Division

If time is tight, use this exact division.

## Person A Builds

- Next.js or React app
- Insforge tables
- API routes
- Nebius analysis route
- dashboard
- fallback demo flow

## Person B Builds

- Vapi prompt
- Nebius prompt
- sample transcripts
- sample JSON report
- dashboard copy
- final demo script
- sales pitch

This gives Person A more coding work while Person B produces everything needed to make the demo persuasive and polished.

---

# Final Demo Responsibilities

## Person A Speaks To

- Technical architecture
- How Vapi, Nebius, and Insforge connect
- What happens after a call
- How the transcript becomes a report

## Person B Speaks To

- Store owner pain point
- Why the product is commercially viable
- What the report means
- How often Scout.ai would call
- Why the business would pay

## Closing Line

Scout.ai helps store owners find out whether their phone calls are making money or losing customers by placing realistic AI mystery calls, saving the transcript, and turning the worst moments into better scripts.
