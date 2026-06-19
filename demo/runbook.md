# Scout.ai Demo Runbook

## Goal

Show that Scout.ai turns a phone call into a specific, owner-friendly coaching report.

## Live Demo Path

1. Open the app.
2. Click `Run a mystery call test`.
3. Use the bike shop scenario.
4. Enter the real phone number Vapi should call.
5. Click `Start mystery call`.
6. Answer the phone and let the AI shopper complete the call.
7. Wait for Vapi to send the transcript through the webhook.
8. Let Scout.ai run Nebius analysis and navigate to the report.
9. Highlight the worst sentence, checklist, and recommended staff script.

## Preflight

- Insforge tables are created.
- `.env.local` has live Insforge, Vapi, and Nebius credentials.
- `VAPI_WEBHOOK_URL` points to a public URL for `/api/calls/webhook`.
- The target phone can receive the call.
- `npm run env:check` passes with `SCOUT_DEMO_MODE=false`.

## Backup Assets

The repo still includes sample transcripts and analysis fixtures for development and rehearsal. Do not use them for the main presentation unless the live sponsor services are unavailable.

## Presenter Checklist

- Say the owner pain point first.
- Mention that the call is realistic and brief.
- Point to the exact transcript sentence that hurt conversion.
- Explain that Scout.ai gives a better response staff can actually say.
- Close with the sponsor stack: Vapi calls, Nebius analyzes, Insforge stores.
