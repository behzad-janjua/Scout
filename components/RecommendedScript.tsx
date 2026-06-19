import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

export default function RecommendedScript({
  script,
  trainingPriority,
}: {
  script?: string | null;
  trainingPriority?: string | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">
        {DASHBOARD_COPY.headings.recommendedStaffScript}
      </div>
      {script ? (
        <div className="stack">
          <p style={{ marginTop: 0 }}>“{script}”</p>
          {trainingPriority && (
            <div>
              <div className="panel-label">
                {DASHBOARD_COPY.headings.trainingPriority}
              </div>
              <p style={{ margin: 0 }}>{trainingPriority}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="placeholder">
          {DASHBOARD_COPY.emptyStates.recommendedScript}
        </p>
      )}
    </div>
  );
}
