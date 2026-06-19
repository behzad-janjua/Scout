import type { Business, Call, Scenario } from "@/lib/types";

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
}: {
  business?: Business | null;
  scenario?: Scenario | null;
  call?: Call | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">Call summary</div>
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
          </div>
        </div>
      ) : (
        <p className="placeholder">
          Call summary will appear here once a test has run (business, scenario,
          date, duration, outcome, score).
        </p>
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
