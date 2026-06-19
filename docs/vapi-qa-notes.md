# Vapi QA Notes

Use this checklist when testing generated mystery shopper calls.

## Realism Checks

- The caller asks one question at a time.
- The caller sounds like a customer, not an auditor.
- For complaint scenarios, the caller can sound frustrated but should not swear, threaten, or insult the employee.
- The caller does not mention scores, lead capture, conversion, or training.
- The caller gives the employee room to help.
- The caller ends naturally after enough evidence is collected.
- The call stays brief, ideally under three minutes.

## Red Flags To Fix

- The caller repeats the scenario too many times.
- The caller asks multiple questions in one turn.
- The caller becomes abusive, repetitive, or salesy.
- The caller reveals that this is a test.
- The caller keeps pushing after the employee gives a clear answer.
- The caller invents details that are not in the scenario.

## Bike Shop Transcript QA

Status: usable for demo.

Fixture files:

- `/fixtures/sample-transcript-bike-shop.txt`
- `/fixtures/sample-analysis-output.json`

Notes:

- The customer is angry about a recent purchase in a simple, believable way.
- The employee responses are plausibly weak without sounding cartoonishly bad.
- The transcript contains clear misses for empathy, ownership, booking, lead capture, and next step.

Highlighted sentence:

```text
Uh, I mean flats happen. We can't really know what caused it.
```

## Salon Transcript QA

Status: usable as secondary scenario.

Fixture files:

- `/fixtures/sample-transcript-salon.txt`
- `/fixtures/sample-analysis-output-salon.json`

Notes:

- The customer has a realistic deadline: an event this weekend.
- The employee misses a direct booking opportunity.
- The transcript tests recommendation quality and appointment capture.

Highlighted sentence:

```text
You can check online or call back later.
```

## Restaurant Transcript QA

Status: usable as secondary scenario.

Fixture files:

- `/fixtures/sample-transcript-restaurant.txt`
- `/fixtures/sample-analysis-output-restaurant.json`

Notes:

- The customer gives party size, occasion, and desired time.
- The employee confirms reservations but fails to secure the table.
- The transcript tests availability handling and contact capture.

Highlighted sentence:

```text
No, just call back tomorrow.
```
