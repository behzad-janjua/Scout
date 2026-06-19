import type { WorstSentence } from "@/lib/types";

export default function WorstSentencesPanel({
  worstSentences = [],
}: {
  worstSentences?: WorstSentence[];
}) {
  return (
    <div className="card">
      <div className="panel-label">Worst sentences</div>
      {worstSentences.length > 0 ? (
        <div className="stack">
          {worstSentences.map((w, i) => (
            <div
              key={i}
              style={{
                borderLeft: "3px solid var(--danger)",
                paddingLeft: 12,
              }}
            >
              <div style={{ fontStyle: "italic" }}>“{w.exact_sentence}”</div>
              <div className="muted" style={{ fontSize: "0.9rem" }}>
                <strong style={{ color: "var(--warn)" }}>{w.issue}.</strong>{" "}
                {w.why_it_hurt_conversion}
              </div>
              <div style={{ fontSize: "0.9rem", marginTop: 4 }}>
                <span className="muted">Better: </span>
                <span style={{ color: "var(--good)" }}>
                  “{w.better_response}”
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="placeholder">
          The sentences that most hurt the sale — with the problem, why it hurt,
          and a better response — will appear here.
        </p>
      )}
    </div>
  );
}
