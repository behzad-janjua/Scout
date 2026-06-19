"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

// Hardcoded data returned after "scraping" the store URL
const SCRAPED = {
  name: "Pacific Rim Bikes",
  phone: "+14155947557",
  displayPhone: "+1 (415) 594-7557",
  type: "bike_shop",
  address: "1842 W 4th Ave, Vancouver, BC",
  hours: "Mon–Sat 10am–6pm",
};

const SCRAPE_STEPS = [
  "Connecting to website...",
  "Reading page content...",
  "Finding business details...",
  "Extracting phone number...",
];

type Scenario = "Angry customer" | "Pricing & products" | "Book a repair" | "Product availability" | "General service";
type Frequency = "One-time" | "Weekly" | "Twice a week" | "Daily";
type TimeSlot = "Morning (9–12pm)" | "Afternoon (12–5pm)" | "Evening (5–8pm)";

const SCENARIO_PRESETS: Record<Scenario, { title: string; goal: string; customer_persona: string; questions_to_ask: string }> = {
  "Angry customer": {
    title: "Angry recent-purchase complaint",
    goal: "See whether staff de-escalate an upset customer and create a clear inspection or warranty next step",
    customer_persona: "Alex, a recent bike buyer who feels let down because the rear tire keeps going flat",
    questions_to_ask: "I bought this bike from you two weeks ago and the rear tire keeps going flat. What are you going to do about that?\nAm I going to have to pay for this?\nCan someone actually look at it tomorrow?",
  },
  "Pricing & products": {
    title: "Pricing & product inquiry",
    goal: "Get a helpful price quote and product recommendation",
    customer_persona: "Jordan, looking to buy a new commuter bike under $800",
    questions_to_ask: "What are your best commuter bikes under $800?\nDo you have anything in stock right now?\nCan I test ride before buying?",
  },
  "Book a repair": {
    title: "E-bike repair inquiry",
    goal: "Convert a repair caller into a booked appointment",
    customer_persona: "Sam, an e-bike owner with a clicking noise in the drivetrain",
    questions_to_ask: "Do you service e-bikes?\nHow long does a repair usually take?\nCan I drop it off this week?",
  },
  "Product availability": {
    title: "In-stock availability check",
    goal: "Confirm product availability and guide toward a visit or hold",
    customer_persona: "Riley, trying to confirm a specific model is in stock before driving over",
    questions_to_ask: "Do you carry Trek FX 3 Disc?\nDo you have size medium in stock?\nCan you hold one for me?",
  },
  "General service": {
    title: "General service experience",
    goal: "Assess overall phone professionalism and helpfulness",
    customer_persona: "Morgan, a first-time caller exploring local bike shop options",
    questions_to_ask: "What services do you offer?\nHow long have you been open?\nWhat are your hours?",
  },
};

type Step = "url" | "scraping" | "customize" | "running";

export default function CreateTestPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("url");
  const [url, setUrl] = useState("pacificrimbikes.com");
  const [scrapeStepIndex, setScrapeStepIndex] = useState(0);

  // Customization state
  const [scenario, setScenario] = useState<Scenario>("Angry customer");
  const [frequency, setFrequency] = useState<Frequency>("One-time");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("Afternoon (12–5pm)");

  // Call state
  const [status, setStatus] = useState("");

  // Advance scraping animation
  useEffect(() => {
    if (step !== "scraping") return;
    if (scrapeStepIndex >= SCRAPE_STEPS.length) {
      const t = setTimeout(() => setStep("customize"), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setScrapeStepIndex((i) => i + 1), 620);
    return () => clearTimeout(t);
  }, [step, scrapeStepIndex]);

  function startScrape(e: React.FormEvent) {
    e.preventDefault();
    setScrapeStepIndex(0);
    setStep("scraping");
  }

  async function pollForTranscript(callId: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      // Tolerate a transient blip (e.g. a 500/HTML page during a dev recompile,
      // or a network hiccup): keep polling instead of aborting the whole flow.
      let call: {
        status?: string;
        transcript?: string;
        failure_reason?: string;
        error?: string;
      } | null = null;
      try {
        const res = await fetch(`/api/calls/${callId}`);
        if (res.ok) call = await res.json();
      } catch {
        call = null;
      }

      if (call) {
        if (call.status === "failed") {
          throw new Error(call.failure_reason ?? "The call failed");
        }
        if (call.transcript && call.transcript.trim().length > 0) {
          return call;
        }
        setStatus(
          `${DASHBOARD_COPY.loadingStates.waitingForTranscript} Current status: ${call.status}`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    throw new Error("Timed out waiting for the transcript");
  }

  async function loadDemoReport() {
    setStep("running");
    setStatus(DASHBOARD_COPY.loadingStates.loadingReport);
    try {
      const res = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fallback: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load demo report");
      router.push(`/reports/${data.report_id}`);
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      setStep("customize");
    }
  }

  async function runTest() {
    setStep("running");
    setStatus(DASHBOARD_COPY.loadingStates.startingCall);
    const preset = SCENARIO_PRESETS[scenario];
    try {
      const res = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: {
            name: SCRAPED.name,
            business_type: SCRAPED.type,
            phone_number: SCRAPED.phone,
            owner_email: "",
          },
          scenario: preset,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStatus("Call placed. Waiting for transcript...");
      await pollForTranscript(data.call_id);
      setStatus(DASHBOARD_COPY.loadingStates.analyzing);
      const analysisRes = await fetch("/api/reports/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: data.call_id }),
      });
      const report = await analysisRes.json();
      if (!analysisRes.ok) throw new Error(report.error ?? "Analysis failed");
      router.push(`/reports/${report.report_id}`);
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      setStep("customize");
    }
  }

  // ── URL step ──────────────────────────────────────────────────────────────
  if (step === "url") {
    return (
      <div className="stack setup-stack">
        <section>
          <span className="tag">Step 1 of 2</span>
          <h1 style={{ marginTop: 12 }}>Enter your store website</h1>
          <p className="lede">
            We&apos;ll scan your site to pull your business info and phone number
            automatically.
          </p>
        </section>

        <form className="card" onSubmit={startScrape}>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Store website</label>
            <div className="url-row">
              <span className="url-prefix">https://</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourbikeshop.com"
                required
              />
            </div>
          </div>
          <button className="btn btn-full" type="submit">
            Analyze store
          </button>
        </form>
      </div>
    );
  }

  // ── Scraping step ─────────────────────────────────────────────────────────
  if (step === "scraping") {
    return (
      <div className="stack setup-stack">
        <section>
          <h1>Scanning {url}&hellip;</h1>
        </section>

        <div className="card scrape-card">
          {SCRAPE_STEPS.map((label, i) => (
            <div key={label} className={`scrape-step ${i < scrapeStepIndex ? "done" : i === scrapeStepIndex ? "active" : "waiting"}`}>
              <span className="scrape-dot">
                {i < scrapeStepIndex ? "✓" : i === scrapeStepIndex ? <span className="spinner" /> : "·"}
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Customize step ────────────────────────────────────────────────────────
  if (step === "customize") {
    return (
      <div className="stack setup-stack">
        <section>
          <span className="tag">Step 2 of 2</span>
          <h1 style={{ marginTop: 12 }}>Customize your test</h1>
        </section>

        {/* Extracted info banner */}
        <div className="card extracted-card">
          <div className="extracted-check">&#10003; Store info extracted from {url}</div>
          <div className="extracted-name">{SCRAPED.name}</div>
          <div className="extracted-meta">
            <span className="extracted-phone">{SCRAPED.displayPhone}</span>
            <span className="dot-sep">·</span>
            <span>Bike shop</span>
            <span className="dot-sep">·</span>
            <span>{SCRAPED.address}</span>
            <span className="dot-sep">·</span>
            <span>{SCRAPED.hours}</span>
          </div>
          <div className="phone-callout">
            Scout will call <strong>{SCRAPED.displayPhone}</strong> as a mystery shopper.
          </div>
        </div>

        {/* Customization card */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>What should we test?</h2>

          <div className="field">
            <label>Test scenario</label>
            <div className="pill-group">
              {(Object.keys(SCENARIO_PRESETS) as Scenario[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`pill ${scenario === s ? "active" : ""}`}
                  onClick={() => setScenario(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>How often to test</label>
            <div className="pill-group">
              {(["One-time", "Weekly", "Twice a week", "Daily"] as Frequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`pill ${frequency === f ? "active" : ""}`}
                  onClick={() => setFrequency(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Best time to call</label>
            <div className="pill-group">
              {(["Morning (9–12pm)", "Afternoon (12–5pm)", "Evening (5–8pm)"] as TimeSlot[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pill ${timeSlot === t ? "active" : ""}`}
                  onClick={() => setTimeSlot(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario preview */}
        <div className="card scenario-preview">
          <div className="panel-label">Scenario preview</div>
          <div className="preview-row">
            <span className="preview-label">Goal</span>
            <span>{SCENARIO_PRESETS[scenario].goal}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Caller</span>
            <span>{SCENARIO_PRESETS[scenario].customer_persona}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Questions</span>
            <span style={{ whiteSpace: "pre-line" }}>{SCENARIO_PRESETS[scenario].questions_to_ask}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <div className="spread">
            <div>
              <strong>Ready to call {SCRAPED.displayPhone}</strong>
              <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
                {scenario} · {frequency} · {timeSlot}
              </div>
            </div>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <button className="btn" onClick={runTest}>
                Start mystery call
              </button>
              <button className="btn btn-ghost" onClick={loadDemoReport}>
                Load demo report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Running step ──────────────────────────────────────────────────────────
  return (
    <div className="stack setup-stack">
      <section>
        <h1>Calling {SCRAPED.displayPhone}&hellip;</h1>
        <p className="lede">{status || "Placing the mystery shopper call now."}</p>
      </section>
      <div className="card scrape-card">
        <div className="scrape-step active">
          <span className="scrape-dot"><span className="spinner" /></span>
          <span>{status || "Connecting..."}</span>
        </div>
      </div>
    </div>
  );
}
