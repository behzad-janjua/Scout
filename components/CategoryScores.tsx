import type { CategoryScores as CategoryScoresType } from "@/lib/types";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

const LABELS = DASHBOARD_COPY.categoryLabels;

// Color a single category bar the same way the overall score is bucketed.
function toneFor(value: number): string {
  if (value >= 75) return "var(--good)";
  if (value >= 60) return "var(--warn)";
  return "var(--danger)";
}

export default function CategoryScores({
  scores,
}: {
  scores?: CategoryScoresType | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">
        {DASHBOARD_COPY.headings.categoryScores}
      </div>
      {scores ? (
        <div className="stack" style={{ gap: 12 }}>
          {(Object.keys(LABELS) as (keyof CategoryScoresType)[]).map((k) => {
            const value = scores[k];
            return (
              <div key={k}>
                <div className="spread" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: "0.9rem" }}>{LABELS[k]}</span>
                  <strong style={{ color: toneFor(value) }}>{value}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, value))}%`,
                      background: toneFor(value),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="placeholder">
          {DASHBOARD_COPY.emptyStates.categoryScores}
        </p>
      )}
    </div>
  );
}
