# Scout.ai Demo Runbook

## Goal

Show that Scout.ai turns a phone call into a specific, owner-friendly coaching report.

## Reliable Demo Path

1. Open the app.
2. Click `Run a mystery call test`.
3. Use the bike shop scenario.
4. Click `Load demo report` if live Vapi/Nebius/Insforge credentials are not ready.
5. Start the explanation at the transcript.
6. Highlight the worst sentence: "You can just bring it in sometime."
7. Show the lead capture checklist.
8. End on the recommended staff script.

## Live Demo Path

Use this only when all sponsor credentials are working.

1. Create the business and scenario.
2. Start the Vapi call.
3. Confirm the Vapi webhook writes call status and transcript.
4. Run Nebius analysis.
5. Load the saved report from Insforge.

## Fallback Trigger

Use fallback mode if any of these fail:

- outbound call does not connect
- webhook tunnel is down
- transcript does not arrive
- Nebius response is invalid JSON
- Insforge read/write fails

The fallback path should still tell the same product story. Do not frame it as fake data; frame it as the backup demo path using a representative completed call.

## Presenter Checklist

- Say the owner pain point first.
- Mention that the call is realistic and brief.
- Point to the exact transcript sentence that hurt conversion.
- Explain that Scout.ai gives a better response staff can actually say.
- Close with the sponsor stack: Vapi calls, Nebius analyzes, Insforge stores.
