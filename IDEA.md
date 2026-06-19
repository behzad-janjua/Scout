# Scout.ai Hackathon Plan

## Product Summary

**Scout.ai** is an AI secret shopper for phone calls. It helps store owners test their own business by placing realistic AI mystery calls, saving the transcript, analyzing the customer experience, and showing exactly where sales are being lost.

**One-liner:** Scout.ai calls your business like a real customer, scores the experience, and shows which sentences lost the sale.

**Target customer:** Local business owners who rely on inbound calls, including salons, restaurants, bike shops, auto shops, clinics, med spas, dentists, gyms, repair shops, and retail stores.

**Core problem:** Business owners spend money on ads, referrals, SEO, and reviews to make the phone ring, but they often do not know whether staff are converting those calls into customers.

**Core value:** Scout.ai reveals missed revenue moments and gives owners specific coaching scripts to improve call conversion.

---

## Sponsor Stack

Scout.ai uses all three hackathon sponsor technologies in a clear full-stack workflow.

| Sponsor      | Role in Scout.ai                | What It Powers                                                                                                                     |
| ------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Vapi**     | Voice AI layer                  | Places realistic mystery shopper calls, handles the live conversation, records/transcribes calls                                   |
| **Nebius**   | AI reasoning and analysis layer | Generates caller scenarios, analyzes transcripts, scores performance, identifies worst sentences, creates coaching recommendations |
| **Insforge** | Backend and database layer      | Stores businesses, call scenarios, transcripts, analysis reports, scores, and dashboard data                                       |

---

## End-to-End Flow

```text
Business owner creates a mystery call test
        ↓
Scout.ai generates a realistic customer scenario
        ↓
Vapi places the call to the business
        ↓
The AI shopper talks like a real customer
        ↓
Vapi records and transcribes the call
        ↓
Insforge stores the transcript and call metadata
        ↓
Nebius analyzes the transcript
        ↓
Insforge stores the report, scores, and recommendations
        ↓
Owner views the Scout.ai dashboard
```

---

## Example Scenario

**Business type:** Bike shop  
**Test scenario:** Customer asking about e-bike repair  
**Goal:** See whether the employee converts the caller into a repair appointment.

Example AI shopper call:

```text
Scout.ai: Hi, I was wondering if you repair e-bikes.
Employee: Yeah, we probably do that.
Scout.ai: Great. I have one that is making a clicking noise. Can I bring it in this week?
Employee: You can just bring it in sometime.
Scout.ai: Okay, do I need an appointment?
Employee: Not really, just stop by.
Scout.ai: Alright, thanks.
Employee: Okay, bye.
```

Example report:

```text
Overall Score: 62/100
Outcome: Missed sales opportunity
Customer Intent: High

Main Issue:
The employee answered the customer's question but did not ask for the customer's name, phone number, or preferred appointment time.

Worst Sentence:
"You can just bring it in sometime."

Why it hurt conversion:
The employee gave a vague next step instead of booking a visit or capturing the lead.

Better Response:
"Yes, we can help with that. We have openings this afternoon and tomorrow morning. Would you like me to reserve a repair slot?"
```

---

## MVP Scope

The hackathon MVP should focus on one complete, polished loop.

### Must Have

1. Business owner can create a test scenario.
2. Vapi places or simulates a mystery shopper call.
3. The call transcript is captured.
4. Transcript is stored in Insforge.
5. Nebius analyzes the transcript.
6. Dashboard displays:
   - full transcript
   - overall score
   - outcome
   - worst sentences
   - missed revenue moments
   - lead capture checklist
   - recommended staff script

### Nice to Have

1. Multiple business types.
2. Multiple call scenarios per business.
3. Weekly call schedule.
4. Trend score over time.
5. Employee coaching mode.
6. Estimated lost revenue.
7. Email report to the store owner.

---

## Vapi Integration Plan

Vapi is the voice layer for Scout.ai.

### Vapi Responsibilities

- Create the AI mystery shopper voice agent.
- Call the business phone number.
- Speak naturally as a potential customer.
- Ask scenario-specific questions.
- Record the call.
- Generate or return a transcript.
- Send transcript and call metadata to the backend.

### Vapi Agent Behavior

The Vapi agent should behave like a normal customer, not like an auditor.

Example system behavior:

```text
You are a realistic customer calling a local business. Your goal is to ask about the assigned scenario and determine whether the employee helps you, captures your information, and gives a clear next step. Do not reveal that you are an AI or an auditor unless directly required by the product's compliance settings. Keep the conversation natural, polite, and brief.
```

### Vapi Call Inputs

- business_name
- business_type
- phone_number
- scenario
- customer_persona
- goal_of_call
- questions_to_ask

### Vapi Call Outputs

- call_id
- recording_url
- transcript
- call_duration
- call_status
- timestamp

---

## Nebius Integration Plan

Nebius powers the intelligence layer of Scout.ai.

### Nebius Responsibilities

1. Generate realistic caller scenarios.
2. Analyze call transcripts.
3. Score customer experience.
4. Identify worst sentences.
5. Explain why each sentence hurt conversion.
6. Suggest better responses.
7. Create a simple owner-friendly report.
8. Generate staff training scripts.

### Nebius Analysis Prompt

```text
You are Scout.ai, an AI phone sales auditor for local businesses.

Analyze the following mystery shopper call transcript.

Business type: {{business_type}}
Scenario: {{scenario}}
Transcript:
{{transcript}}

Return a structured JSON report with:

1. overall_score from 0 to 100
2. outcome: converted, partially_converted, missed_opportunity, poor_experience
3. customer_intent: low, medium, high
4. summary
5. what_went_well: list of 3 items max
6. worst_sentences: list of up to 5 objects, each with:
   - exact_sentence
   - issue
   - why_it_hurt_conversion
   - better_response
7. missed_revenue_moments: list of moments
8. lead_capture_checklist with booleans for:
   - asked_name
   - asked_phone
   - identified_need
   - confirmed_availability
   - offered_booking
   - gave_clear_next_step
   - asked_for_sale
9. recommended_staff_script
10. top_training_priority
```

### Example Nebius JSON Output

```json
{
  "overall_score": 62,
  "outcome": "missed_opportunity",
  "customer_intent": "high",
  "summary": "The employee confirmed the shop may work on e-bikes but did not collect contact information, offer an appointment, or create a clear next step.",
  "what_went_well": [
    "The call was answered quickly.",
    "The employee understood that the customer was asking about e-bike repair.",
    "The employee did not refuse the request."
  ],
  "worst_sentences": [
    {
      "exact_sentence": "Yeah, we probably do that.",
      "issue": "Uncertain answer",
      "why_it_hurt_conversion": "The employee sounded unsure, which weakens customer confidence.",
      "better_response": "Yes, we service most e-bikes. What brand do you have, and what issue are you seeing?"
    },
    {
      "exact_sentence": "You can just bring it in sometime.",
      "issue": "No booking attempt",
      "why_it_hurt_conversion": "The employee gave a vague next step instead of converting the caller into a scheduled visit.",
      "better_response": "We have openings this afternoon and tomorrow morning. Would you like me to reserve a repair slot?"
    },
    {
      "exact_sentence": "Okay, bye.",
      "issue": "No lead capture",
      "why_it_hurt_conversion": "The call ended without capturing the customer's name, phone number, or next step.",
      "better_response": "Before you go, can I grab your name and number so we can hold a spot for you?"
    }
  ],
  "missed_revenue_moments": [
    "The caller showed high buying intent by asking if they could bring in the bike this week, but the employee did not offer a specific appointment time."
  ],
  "lead_capture_checklist": {
    "asked_name": false,
    "asked_phone": false,
    "identified_need": true,
    "confirmed_availability": false,
    "offered_booking": false,
    "gave_clear_next_step": false,
    "asked_for_sale": false
  },
  "recommended_staff_script": "Yes, we can help with that. What kind of e-bike do you have? We have repair openings this afternoon and tomorrow. Would you like me to reserve a time? I can take your name and phone number now.",
  "top_training_priority": "Train staff to move from answering questions to booking the next step."
}
```

---

## Insforge Integration Plan

Insforge is the backend and database layer for Scout.ai.

### Insforge Responsibilities

- Store business profiles.
- Store test scenarios.
- Store Vapi call metadata.
- Store full transcripts.
- Store Nebius analysis results.
- Power the owner dashboard.
- Track call history and trends over time.

### Suggested Data Model

#### businesses

| Field         | Type      | Notes                              |
| ------------- | --------- | ---------------------------------- |
| id            | uuid      | Primary key                        |
| name          | text      | Business name                      |
| business_type | text      | Restaurant, salon, bike shop, etc. |
| phone_number  | text      | Number Scout.ai will call          |
| owner_email   | text      | Optional                           |
| created_at    | timestamp | Created date                       |

#### scenarios

| Field            | Type      | Notes                                    |
| ---------------- | --------- | ---------------------------------------- |
| id               | uuid      | Primary key                              |
| business_id      | uuid      | Related business                         |
| title            | text      | Scenario name                            |
| description      | text      | What the AI shopper should ask about     |
| goal             | text      | What conversion behavior is being tested |
| customer_persona | text      | Example caller persona                   |
| created_at       | timestamp | Created date                             |

#### calls

| Field         | Type      | Notes                      |
| ------------- | --------- | -------------------------- |
| id            | uuid      | Primary key                |
| business_id   | uuid      | Related business           |
| scenario_id   | uuid      | Related scenario           |
| vapi_call_id  | text      | Vapi call identifier       |
| status        | text      | completed, failed, pending |
| call_duration | integer   | Duration in seconds        |
| recording_url | text      | Optional recording link    |
| transcript    | text      | Full call transcript       |
| created_at    | timestamp | Call date                  |

#### reports

| Field                    | Type      | Notes                                                               |
| ------------------------ | --------- | ------------------------------------------------------------------- |
| id                       | uuid      | Primary key                                                         |
| call_id                  | uuid      | Related call                                                        |
| overall_score            | integer   | 0 to 100                                                            |
| outcome                  | text      | converted, partially_converted, missed_opportunity, poor_experience |
| customer_intent          | text      | low, medium, high                                                   |
| summary                  | text      | Human-readable summary                                              |
| what_went_well           | json      | Positive observations                                               |
| worst_sentences          | json      | Exact sentences and coaching feedback                               |
| missed_revenue_moments   | json      | Missed conversion opportunities                                     |
| lead_capture_checklist   | json      | Boolean checklist                                                   |
| recommended_staff_script | text      | Improved call script                                                |
| top_training_priority    | text      | Main thing to improve                                               |
| created_at               | timestamp | Report creation date                                                |

---

## Dashboard Requirements

The Scout.ai dashboard should be simple enough for a busy store owner.

### Dashboard Sections

1. **Call Summary**
   - business name
   - scenario
   - date/time
   - duration
   - outcome
   - score

2. **Transcript**
   - full transcript
   - speaker labels
   - highlighted worst sentences

3. **Worst Sentences**
   - exact sentence
   - problem
   - why it hurt the sale
   - better response

4. **Lead Capture Checklist**
   - asked for name
   - asked for phone number
   - identified need
   - confirmed availability
   - offered booking
   - gave clear next step
   - asked for the sale

5. **Recommended Script**
   - owner-friendly script that staff can use immediately

6. **Training Priority**
   - one clear action item for the team

---

## Call Frequency Product Plans

Scout.ai can be sold to store owners as a recurring quality and sales testing tool.

### Starter Plan

**1 mystery call per week**

Best for small businesses that want a basic quality check.

### Growth Plan

**3 mystery calls per week**

Best for businesses with multiple employees or meaningful phone volume.

### Pro Plan

**Daily mystery calls**

Best for busy businesses, multi-location operators, clinics, restaurants, salons, and service businesses.

### Recommended Test Times

| Time         | What It Tests                   |
| ------------ | ------------------------------- |
| Morning      | Opening readiness               |
| Lunch rush   | Busy-period handling            |
| Afternoon    | Normal service quality          |
| Near closing | Whether staff still try to help |
| Weekend      | Peak customer traffic           |

---

## Demo Plan

### Demo Goal

Show judges that Scout.ai is not just a voice bot. It is a full multimodal business intelligence agent that uses voice, transcript analysis, backend storage, and actionable coaching.

### Demo Script

1. Open Scout.ai dashboard.
2. Create a business: **BrightBike Repair**.
3. Create a scenario: **Customer asks about e-bike repair availability**.
4. Trigger a Vapi mystery call.
5. Show the transcript saved in Insforge.
6. Run Nebius analysis.
7. Show the final report:
   - score
   - outcome
   - worst sentences
   - missed revenue moments
   - better responses
   - recommended script
8. End with the owner value proposition.

### Final Pitch Line

**Scout.ai helps local businesses find out whether their phone calls are making money or losing customers.**

---

## Prize Track Strategy

### Vapi Track

Scout.ai is highly relevant for the Vapi track because the core experience is a realistic voice AI mystery shopper.

**Why it fits:**

- Uses Vapi for live voice calls.
- Demonstrates a commercially viable voice agent.
- Clear sales use case for local businesses.
- Easy for judges to understand and demo.

**Vapi pitch:**

Scout.ai uses Vapi to place realistic AI mystery shopper calls that test how well businesses convert inbound phone leads.

### Nebius Track

Scout.ai is relevant for Nebius because the LLM is responsible for both scenario generation and transcript intelligence.

**Why it fits:**

- Uses Nebius for transcript analysis.
- Generates structured reports from messy conversations.
- Identifies worst sentences and explains why they hurt conversion.
- Produces better scripts and training priorities.

**Nebius pitch:**

Scout.ai uses Nebius as the reasoning engine that turns raw call transcripts into business coaching and revenue insights.

### Insforge Track

Scout.ai is relevant for Insforge because it needs a real backend to store businesses, scenarios, transcripts, scores, and reports.

**Why it fits:**

- Uses Insforge as the database and backend.
- Stores call history and transcript data.
- Powers the dashboard.
- Enables recurring tests and historical trend analysis.

**Insforge pitch:**

Scout.ai uses Insforge to manage the complete mystery call workflow, from business profiles to transcript storage to owner-facing reports.

---

## Build Timeline for Hackathon Day

### 10:00 - 11:00: Technical Demos

- Confirm Vapi call flow.
- Confirm Nebius API usage.
- Confirm Insforge backend setup.

### 11:00 - 12:00: Setup and Data Model

- Create Insforge tables.
- Build basic dashboard shell.
- Create business and scenario forms.

### 12:00 - 1:00: Vapi Call Flow

- Build Vapi assistant prompt.
- Trigger a test call or simulated call.
- Capture transcript.

### 1:00 - 2:00: Nebius Transcript Analysis

- Build transcript analysis prompt.
- Return structured JSON.
- Store report in Insforge.

### 2:00 - 3:00: Dashboard Polish

- Display transcript.
- Highlight worst sentences.
- Show score, checklist, and recommendations.

### 3:00 - 4:00: Demo Prep

- Create a strong sample business scenario.
- Test full flow.
- Prepare backup transcript in case live call fails.
- Practice 3-minute demo.

---

## Backup Plan

If live outbound calling fails during the demo, use a pre-recorded or pre-written transcript and still show the full Scout.ai value chain:

1. Simulated Vapi transcript.
2. Transcript stored in Insforge.
3. Nebius analysis.
4. Dashboard report.

This still demonstrates the product clearly and protects the team from demo risk.

---

## Ethical and Compliance Notes

Scout.ai should be sold as a tool for business owners to test their own business, not to deceive unrelated third parties.

Recommended positioning:

- Business owners opt in to have their own business tested.
- Calls are used for training and quality improvement.
- Reports are private to the owner.
- The product should follow applicable call recording and consent rules depending on location.

For the hackathon demo, use a test number, team member number, sponsor demo line, or simulated business instead of calling an unrelated real business.

---

## Final Product Positioning

**Scout.ai**  
**AI secret shopping for phone calls.**

Scout.ai helps store owners find out what really happens when customers call. It places realistic AI mystery calls, keeps the transcript, highlights the worst moments, and gives staff the exact words they should use to convert more customers.
