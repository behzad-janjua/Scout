import type { Business, Call, Report, Scenario } from "@/lib/types";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

function fmtDuration(seconds?: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function CallSummaryCard({
  business,
  scenario,
  call,
  report,
}: {
  business?: Business | null;
  scenario?: Scenario | null;
  call?: Call | null;
  report?: Report | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">{DASHBOARD_COPY.headings.reportOverview}</div>
      {business ? (
        <div className="stack">
          <div className="spread">
            <div>
              <h2 style={{ marginBottom: 2 }}>{business.name}</h2>
              <div className="muted">{scenario?.title ?? "—"}</div>
            </div>
            <span className="tag">{call?.status ?? "no call"}</span>
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: 24 }}>
            <Stat label="Type" value={business.business_type} />
            <Stat label="Duration" value={fmtDuration(call?.duration_seconds)} />
            <Stat
              label="When"
              value={
                call?.started_at
                  ? new Date(call.started_at).toLocaleString()
                  : "—"
              }
            />
            {report?.outcome && (
              <Stat
                label="Outcome"
                value={DASHBOARD_COPY.outcomeLabels[report.outcome]}
              />
            )}
            {report?.customer_intent && (
              <Stat
                label="Customer"
                value={DASHBOARD_COPY.intentLabels[report.customer_intent]}
              />
            )}
          </div>
          <div className="panel-label" style={{ marginBottom: 0 }}>
            Recording
          </div>
          {call?.recording_url ? (
            <a className="muted" href={call.recording_url} target="_blank" rel="noreferrer">
              ▶ Listen to the call recording
            </a>
          ) : (
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              {DASHBOARD_COPY.emptyStates.recording}
            </span>
          )}
        </div>
      ) : (
        <p className="placeholder">{DASHBOARD_COPY.emptyStates.callSummary}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="panel-label">{label}</div>
      <div>{value}</div>
    </div>
  );
}
