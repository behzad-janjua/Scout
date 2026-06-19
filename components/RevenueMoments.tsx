import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

// Two complementary lists: positives the employee earned ("what went well")
// and revenue that slipped away ("missed revenue moments").
export default function RevenueMoments({
  whatWentWell = [],
  missedRevenueMoments = [],
}: {
  whatWentWell?: string[];
  missedRevenueMoments?: string[];
}) {
  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="panel-label">{DASHBOARD_COPY.headings.whatWentWell}</div>
        {whatWentWell.length > 0 ? (
          <ul className="clean">
            {whatWentWell.map((item, i) => (
              <li key={i}>
                <span style={{ color: "var(--good)", marginRight: 6 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="placeholder">
            {DASHBOARD_COPY.emptyStates.whatWentWell}
          </p>
        )}
      </div>

      <div className="card">
        <div className="panel-label">
          {DASHBOARD_COPY.headings.missedRevenueMoments}
        </div>
        {missedRevenueMoments.length > 0 ? (
          <ul className="clean">
            {missedRevenueMoments.map((item, i) => (
              <li key={i}>
                <span style={{ color: "var(--warn)", marginRight: 6 }}>!</span>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="placeholder">
            {DASHBOARD_COPY.emptyStates.missedRevenueMoments}
          </p>
        )}
      </div>
    </div>
  );
}
