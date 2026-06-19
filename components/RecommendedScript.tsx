export default function RecommendedScript({
  script,
  trainingPriority,
}: {
  script?: string | null;
  trainingPriority?: string | null;
}) {
  return (
    <div className="card">
      <div className="panel-label">Recommended script</div>
      {script ? (
        <div className="stack">
          <p style={{ marginTop: 0 }}>“{script}”</p>
          {trainingPriority && (
            <div>
              <div className="panel-label">Top training priority</div>
              <p style={{ margin: 0 }}>{trainingPriority}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="placeholder">
          A ready-to-use script your staff can say on the next call — plus the
          one training priority to focus on — will appear here.
        </p>
      )}
    </div>
  );
}
