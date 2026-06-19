import type { LeadCaptureChecklist } from "@/lib/types";

const LABELS: Record<keyof LeadCaptureChecklist, string> = {
  asked_name: "Asked for name",
  asked_phone: "Asked for phone number",
  identified_need: "Identified the customer's need",
  confirmed_availability: "Confirmed availability",
  offered_booking: "Offered a booking",
  gave_clear_next_step: "Gave a clear next step",
  asked_for_sale: "Asked for the sale",
};

export default function ChecklistPanel({
  checklist,
}: {
  checklist?: LeadCaptureChecklist | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">Lead capture checklist</div>
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
        <p className="placeholder">
          A checklist of the key lead-capture moments (name, phone, booking,
          next step, asking for the sale) will appear here.
        </p>
      )}
    </div>
  );
}
