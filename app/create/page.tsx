"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BusinessForm, { BusinessFormValue } from "@/components/BusinessForm";
import ScenarioForm, { ScenarioFormValue } from "@/components/ScenarioForm";

export default function CreateTestPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessFormValue | null>(null);
  const [scenario, setScenario] = useState<ScenarioFormValue | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function runTest(fallback: boolean) {
    setBusy(true);
    setStatus(
      fallback ? "Loading demo report…" : "Creating records and starting call…"
    );
    try {
      const res = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, scenario, fallback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      // Phase 1 stub returns a report_id (or demo id) to navigate to.
      if (data.report_id) {
        router.push(`/reports/${data.report_id}`);
      } else {
        setStatus(
          `Stub OK — call ${data.call_id ?? "?"} created. Wire-up pending (Phase 3).`
        );
      }
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <section>
        <h1>Run a mystery call test</h1>
        <p className="lede">
          Describe the business and the scenario. Scout.ai will place a realistic
          AI mystery shopper call, then score how well the call was handled.
        </p>
      </section>

      <div className="grid grid-2">
        <BusinessForm onChange={setBusiness} />
        <ScenarioForm onChange={setScenario} />
      </div>

      <div className="card">
        <div className="spread">
          <div>
            <strong>Ready to test</strong>
            <div className="muted" style={{ fontSize: "0.9rem" }}>
              {status || "Start a live call, or load the demo report instantly."}
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button
              className="btn"
              disabled={busy}
              onClick={() => runTest(false)}
            >
              Start mystery call
            </button>
            <button
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => runTest(true)}
            >
              Load demo report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
