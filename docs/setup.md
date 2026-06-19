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
npm run check:live
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

The real demo should run with:

```text
SCOUT_DEMO_MODE=false
```

Live mode needs credentials for all three sponsor integrations:

- Insforge API URL and API key
- Vapi API key, phone number ID, and webhook URL
- Nebius API key, base URL, and model

To check what is missing:

```bash
npm run env:check
```

## Live Demo Checklist

Before presenting, confirm:

- `npm run env:check` passes with `SCOUT_DEMO_MODE=false`.
- `npm run check:live` passes after credentials are set.
- `npm run setup:db` creates the Insforge tables.
- `npm run seed:db` can write a demo record set.
- `VAPI_WEBHOOK_URL` is publicly reachable by Vapi.
- A real outbound Vapi call reaches the target phone.
- The webhook stores the transcript on the call record.
- `/api/reports/analyze` creates a Nebius report from the real transcript.

`VAPI_ASSISTANT_ID` is optional because the app can create an inline assistant from the prompt file.
