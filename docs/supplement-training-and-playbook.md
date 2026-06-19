# Scout.ai — Supplement: Vision Layer (Training & Business Playbook)

> **This is a vision / roadmap addendum to the existing `Scout.ai Hackathon Plan`.**
>
> The hackathon MVP — the **covert mystery-shopper audit** — is already specified in the
> main plan and is being built. This document does **not** add build tasks for the
> hackathon. It describes where the product goes *after* the audit, so the team can pitch a
> bigger, more defensible product to the judges. The future data model is included to make
> that vision technically credible, not to be implemented during the event.
>
> Locked product decisions are listed in §10.

---

## 1. The "why": from one report card to a self-improving system

The MVP audit answers one question: *"When a real customer calls, is my staff converting them?"* — a single covert call, scored once.

The vision extends Scout.ai along a single throughline — **every covert call makes the business smarter:**

1. **Audit (today).** A covert AI caller tests real conversion behavior and scores it.
2. **Training (vision).** The same covert caller is pointed at *hard* situations on purpose — rude, irrational, high-stress callers, plus the boring-but-frequent repeat questions — so staff are stress-tested *without burning real leads or real revenue*.
3. **Playbook (vision).** Scout.ai automatically harvests the winning answers and the most common caller situations into a reusable, business-specific **Playbook** — the onboarding doc the next hire starts with on day one.

One line for the judges:

> **Scout.ai isn't a one-time report card. Every covert call trains the team and writes the business its own sales playbook.**

This is also the strongest version of the **Insforge** story: the asset is not a single transcript, it's an accumulating knowledge base unique to each business.

---

## 2. The roadmap (all modes covert)

| Phase | Status | Purpose | Output |
| --- | --- | --- | --- |
| **1 · Audit** | Hackathon MVP (being built) | Test real conversion on a covert call | Score + report |
| **2 · Training** | Vision | Covertly stress-test staff with hard personas & edge cases | Per-call score + coaching |
| **3 · Playbook** | Vision | Auto-collect winning answers + common situations | Reusable onboarding playbook |

All phases keep the existing covert model from the main plan: the employee believes they are talking to a real customer. Scout.ai is sold to the **owner**, who is testing and training **their own** business.

---

## 3. Core concepts (for when this gets built)

- **Persona** — who is calling and how they behave (e.g. "angry refund customer", "indecisive price-shopper", "asks the FAQ everyone asks"). Drives the Vapi agent.
- **Difficulty** — a simple `easy / normal / hard` field that scales how unreasonable the persona is.
- **Knowledge source** — material the owner uploads (retention / persuasion / negotiation / objection-handling guides, product & service catalog). Used to make the AI *caller* harder and more realistic for that specific business.
- **Win** — a moment where the employee handled a hard situation well. Wins are the raw material of the Playbook.
- **Playbook entry** — a curated "situation → best response" pair for one business.

---

## 4. Future data model (NOT a hackathon build)

Builds on the existing `businesses`, `scenarios`, `calls`, `reports` tables.

### `personas`
| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| business_id | uuid | Nullable — null = global template |
| name | text | e.g. "Angry refund caller" |
| difficulty | text | easy / normal / hard |
| behavior_prompt | text | Vapi system-behavior snippet |
| edge_cases | json | Curveballs the caller may throw |
| source | text | `preset` or `generated` |

### `training_sessions`
| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| business_id | uuid | Related business |
| persona_id | uuid | Persona used |
| employee_name | text | Who was tested (free text) |
| vapi_call_id | text | Vapi call id |
| transcript | text | Full transcript |
| report_id | uuid | Reuses the existing `reports` analysis |

### `knowledge_sources`
| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| business_id | uuid | Owner of the material |
| title | text | e.g. "Objection handling guide" |
| kind | text | retention / persuasion / negotiation / catalog |
| content | text | Pasted text |

### `playbook_entries`
| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| business_id | uuid | Owner of the playbook |
| situation | text | The recurring situation / question |
| best_response | text | The winning answer |
| source_session_id | uuid | Where the win came from |
| times_seen | integer | How often it recurs (for ranking) |

> **Design note:** a training call reuses the **existing** Nebius pipeline and `reports`
> table. Only the *caller* changes (a persona instead of a generic customer). So this layer
> is mostly new tables + two prompts, not a second engine.

---

## 5. Vapi (vision): a harder, business-aware caller

The Vapi agent already plays a realistic customer. In the vision it plays a **persona grounded in the business's own material**, so drills match the real product and the real objections that business faces.

- Inject `persona.behavior_prompt`, `persona.difficulty`, `persona.edge_cases`.
- Ground the persona in the owner's `knowledge_sources` so the curveballs are specific to this business (real objections, real product gaps), not generic.
- Stay covert and in character; throw at least one edge case per call.

Example persona behavior snippet (hard / angry refund caller):

```text
You are a customer frustrated that a product broke after two days.
You start polite but get impatient if the employee is vague or slow.
At some point, demand a full refund and threaten a bad review.
Hidden goal: see whether the employee stays calm, takes ownership, offers a concrete
resolution, and tries to retain you. Never reveal you are a test. Stay realistic.
```

---

## 6. Nebius (vision): generate hard personas, auto-harvest wins

Two new jobs, both reusing the existing JSON-report structure.

### 6.1 Persona generation from the business's own knowledge
```text
You are Scout.ai's scenario designer.
Business type: {{business_type}}
Company materials: {{knowledge_sources}}
Generate caller personas at difficulty {{difficulty}} that stress-test how staff handle
hard moments for THIS business. For each: name, behavior_prompt, and 2-3 edge_cases
(business-specific curveballs). Return JSON only.
```

### 6.2 Automatic win extraction (feeds the Playbook)
For the hackathon vision this is fully automatic — no human approval step.
```text
From this transcript and report, extract up to 3 "wins": moments where the employee
handled a hard situation well. For each: situation, best_response, why_it_worked.
Only include genuinely strong moments. Return JSON only.
```
Extracted wins are written straight into `playbook_entries`.

---

## 7. Dashboard (vision): the Playbook is the hero

Keep all existing sections. The vision adds:

1. **Training tab** — pick employee + persona, launch a covert drill, see score history.
2. **Persona library** — presets + "Generate from my business" (Nebius from `knowledge_sources`).
3. **Playbook tab** *(the moment to land with judges)* — "Situation → Best response" cards ranked by `times_seen`, exportable. Pitch it as: *"This is your next hire's onboarding doc — written automatically by your own best calls."*

---

## 8. If/when this gets built (post-hackathon lean path)

Smallest version that still tells the whole story:
1. One preset hard persona (e.g. angry refund caller) wired into Vapi.
2. A training call scored by the **existing** Nebius pipeline.
3. Automatic win extraction producing 2-3 `playbook_entries`.
4. A Playbook tab that displays them.

Persona generation, difficulty levels, recurring-question clustering, and per-employee trends are all later. Keeping it this lean is deliberate — it matches the "simple MVP" decision (§10, Q5).

---

## 9. Ethics & compliance

Scout.ai is covert by design and sold to the owner to test and train **their own** business — that framing from the main plan still holds.

One honest caveat to keep in the back pocket if a judge raises it: covert *training* adds a second subject, the employee, so in a real deployment it behaves like workplace monitoring and must follow local employment and call-recording/consent law. That's the owner's responsibility to disclose per their jurisdiction. For the demo, the "employee" is a team member or sponsor demo line — never an unaware third party.

---

## 10. Locked decisions

| # | Decision | Choice |
| --- | --- | --- |
| Q1 | Covert vs. consented | **Covert** — employee believes it's a real customer |
| Q2 | Training Mode for hackathon | **Vision / slide only** — devs continue the audit MVP |
| Q3 | Win collection | **Automatic** — no approval step for the hackathon |
| Q4 | Purpose of uploaded knowledge | **Make the AI caller harder & more realistic** (not scoring-vs-standard) |
| Q5 | Persona system | **Simplest possible** — one preset persona; generation/difficulty are later |

---

## 11. Pitch lines to use

- **Hook:** *"Scout.ai doesn't just tell you that you lost a sale — it trains your team on the hard calls before they happen."*
- **Insforge payoff:** *"And every win becomes a card in a playbook unique to that business — the onboarding doc your next hire starts with on day one."*
