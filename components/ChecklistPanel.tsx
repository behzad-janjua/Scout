import type { LeadCaptureChecklist } from "@/lib/types";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

const LABELS = DASHBOARD_COPY.checklistLabels;

export default function ChecklistPanel({
  checklist,
}: {
  checklist?: LeadCaptureChecklist | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">
        {DASHBOARD_COPY.headings.leadCaptureChecklist}
      </div>
      {checklist ? (
        <ul className="clean" style={{ listStyle: "none", paddingLeft: 0 }}>
          {(Object.keys(LABELS) as (keyof LeadCaptureChecklist)[]).map((k) => (
            <li key={k} className="row" style={{ gap: 8 }}>
              <span
                style={{ color: checklist[k] ? "var(--good)" : "var(--danger)" }}
              >
                {checklist[k] ? "✓" : "✗"}
              </span>
              <span>{LABELS[k]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="placeholder">{DASHBOARD_COPY.emptyStates.checklist}</p>
      )}
    </div>
  );
}
