"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BusinessForm, { BusinessFormValue } from "@/components/BusinessForm";
import ScenarioForm, { ScenarioFormValue } from "@/components/ScenarioForm";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

export default function CreateTestPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessFormValue | null>(null);
  const [scenario, setScenario] = useState<ScenarioFormValue | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function pollForTranscript(callId: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const res = await fetch(`/api/calls/${callId}`);
      const call = await res.json();
      if (!res.ok) throw new Error(call.error ?? "Could not load call status");
      if (call.status === "failed") {
        throw new Error(call.failure_reason ?? "The call failed");
      }
      if (call.transcript && call.transcript.trim().length > 0) {
        return call;
      }
      setStatus(
        `${DASHBOARD_COPY.loadingStates.waitingForTranscript} Current status: ${call.status}`
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    throw new Error("Timed out waiting for the Vapi transcript");
  }

  // Demo-safe path: skip Vapi/Nebius entirely and load the prebuilt report.
  async function loadDemoReport() {
    setBusy(true);
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
      setBusy(false);
    }
  }

  async function runTest() {
    setBusy(true);
    setStatus(DASHBOARD_COPY.loadingStates.startingCall);
    try {
      const res = await fetch("/api/calls/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business, scenario }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setStatus("Live call placed. Waiting for Vapi to send the transcript...");
      await pollForTranscript(data.call_id);

      setStatus(DASHBOARD_COPY.loadingStates.analyzing);
      const analysisRes = await fetch("/api/reports/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: data.call_id }),
      });
      const report = await analysisRes.json();
      if (!analysisRes.ok) {
        throw new Error(report.error ?? "Analysis failed");
      }
      router.push(`/reports/${report.report_id}`);
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
              {status || "Start a real Vapi call, then analyze the transcript with Nebius."}
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 0 }}>
            <button
              className="btn"
              disabled={busy}
              onClick={() => runTest()}
            >
              Start mystery call
            </button>
            <button
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => loadDemoReport()}
            >
              Load demo report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
