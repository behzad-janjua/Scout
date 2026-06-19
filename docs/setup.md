# Scout.ai Setup

## Dependency Management

Scout.ai uses npm with a committed `package-lock.json`.

Install dependencies:

```bash
npm install
```

Useful commands:

```bash
npm run dev
npm run typecheck
npm run build
npm run env:check
npm run check
```

Project dependency guardrails:

- `package.json` declares the expected Node/npm engines and npm package manager.
- `package.json` uses exact dependency versions.
- `package-lock.json` should stay committed.

## Environment Setup

Create a local env file:

```bash
cp .env.example .env.local
```

The app can run in fixture-backed demo mode with:

```text
SCOUT_DEMO_MODE=true
```

Live mode needs credentials for all three sponsor integrations:

- Insforge API URL and API key
- Vapi API key, assistant ID, phone number ID, and webhook URL
- Nebius API key, base URL, and model

To check what is missing:

```bash
npm run env:check
```

## What Is Still Needed For Live Mode

The repo has route stubs and contracts, but live integration still needs:

- Insforge client setup in `lib/store.ts` or a new `lib/insforge.ts`
- persistent create/read/update functions for businesses, scenarios, calls, and reports
- Vapi outbound call creation in `app/api/calls/start/route.ts`
- Vapi webhook verification and transcript/status updates in `app/api/calls/webhook/route.ts`
- Nebius transcript analysis in `app/api/reports/analyze/route.ts`
- production webhook URL configured in Vapi
