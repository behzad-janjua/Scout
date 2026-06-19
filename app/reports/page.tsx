import Link from "next/link";
import { listReports, getCall, getBusiness } from "@/lib/data";
import { SCORE_CATEGORY_LABEL } from "@/lib/types";

// Reports index — lists every saved Scout.ai report, newest first, so an owner
// (or the demo) can revisit past mystery-call results.
//
// Rendered per-request: the report list is live data, so we never want a build
// -time prerender to reach for Insforge.
export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  const reports = await listReports();

  // Resolve the business name for each report via its call. Fine for the
  // demo-scale dataset; revisit with a join if the report volume grows.
  const rows = await Promise.all(
    reports.map(async (report) => {
      const call = await getCall(report.call_id);
      const business = call ? await getBusiness(call.business_id) : null;
      return { report, businessName: business?.name ?? "Unknown business", call };
    })
  );

  return (
    <div className="stack">
      <section className="spread">
        <div>
          <Link href="/" className="muted">
            ← Back
          </Link>
          <h1 style={{ marginTop: 8 }}>Reports</h1>
        </div>
        <Link className="btn" href="/create">
          Run a mystery call test
        </Link>
      </section>

      {rows.length === 0 ? (
        <div className="card">
          <div className="panel-label">No reports yet</div>
          <p style={{ margin: 0 }}>
            Run a mystery call test to generate your first Scout.ai report.
          </p>
        </div>
      ) : (
        <div className="stack">
          {rows.map(({ report, businessName, call }) => (
            <Link
              key={report.report_id}
              href={`/reports/${report.report_id}`}
              className="card"
              style={{ display: "block", textDecoration: "none", color: "inherit" }}
            >
              <div className="spread">
                <div>
                  <strong>{businessName}</strong>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>
                    {SCORE_CATEGORY_LABEL[report.score_category]}
                    {call?.created_at
                      ? ` · ${new Date(call.created_at).toLocaleString()}`
                      : ""}
                  </div>
                </div>
                <div className={`score-badge cat-${report.score_category}`}>
                  <span className="num">{report.overall_score}</span>
                  <span className="of">/ 100</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
