import Link from "next/link";
import { listReportBundles } from "@/lib/data";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

// Always render fresh — new reports should show up without a rebuild.
export const dynamic = "force-dynamic";

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ReportsIndexPage() {
  const items = await listReportBundles();

  return (
    <div className="stack">
      <section className="spread">
        <div>
          <Link href="/" className="muted">
            ← Back
          </Link>
          <div className="panel-label" style={{ marginTop: 10 }}>
            Reports
          </div>
          <h1 style={{ marginTop: 4 }}>All reports</h1>
          <p className="lede" style={{ marginBottom: 0 }}>
            Every mystery call Scout has analysed, newest first.
          </p>
        </div>
        <Link href="/create" className="btn">
          Test a call
        </Link>
      </section>

      {items.length === 0 ? (
        <div className="card placeholder">
          No reports yet. Run a{" "}
          <Link href="/create">test call</Link> to generate one, or{" "}
          <Link href="/reports/sample">see a sample report</Link>.
        </div>
      ) : (
        <div className="stack">
          {items.map(({ report, business, call }) => (
            <Link
              key={report.report_id}
              href={`/reports/${report.report_id}`}
              className="card report-row"
            >
              <div>
                <strong>{business?.name ?? "Unknown business"}</strong>
                <div className="muted" style={{ fontSize: "0.86rem" }}>
                  {[
                    DASHBOARD_COPY.outcomeLabels[report.outcome],
                    formatDate(report.created_at ?? call?.started_at),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <div className={`score-badge cat-${report.score_category}`}>
                <span className="num">{report.overall_score}</span>
                <span className="of">/ 100</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="muted" style={{ fontSize: "0.86rem" }}>
        Looking for an example?{" "}
        <Link href="/reports/sample">View the sample report</Link>.
      </div>
    </div>
  );
}
