# Scout.ai

Scout.ai is an AI secret shopper for phone calls. It lets a store owner create a realistic mystery call test, capture the transcript, analyze the conversation, and view a coaching report that shows where revenue was lost.

## Current Status

The app currently has:

- Next.js app shell
- create-test flow
- fixture-backed demo report
- report dashboard components
- API route stubs for businesses, scenarios, calls, webhooks, and reports
- prompts, fixtures, and backend contracts for Vapi, Nebius, and Insforge

Still needed for live mode:

- Insforge persistence
- real Vapi outbound calls and webhook updates
- real Nebius transcript analysis
- production deployment/webhook URL

## Setup

Install dependencies:

```bash
npm install
```

Create your local env file:

```bash
cp .env.example .env.local
```

Run the app:

```bash
npm run dev
```

## Scripts

```bash
npm run env:check
npm run typecheck
npm run build
npm run check
```

## Environment

The app can run in demo mode without live credentials:

```text
SCOUT_DEMO_MODE=true
```

Live mode needs:

- `INSFORGE_API_URL`
- `INSFORGE_API_KEY`
- `VAPI_API_KEY`
- `VAPI_ASSISTANT_ID`
- `VAPI_PHONE_NUMBER_ID`
- `VAPI_WEBHOOK_URL`
- `NEBIUS_API_KEY`
- `NEBIUS_BASE_URL`
- `NEBIUS_MODEL`

See [docs/setup.md](docs/setup.md) for dependency and environment details.

## Core Flow

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
