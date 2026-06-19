import Link from "next/link";
import type { ReportBundle } from "@/lib/types";
import { loadDemoBundle } from "@/lib/fixtures";
import { getCall, getReport, getBusiness, getScenario } from "@/lib/store";
import CallSummaryCard from "@/components/CallSummaryCard";
import ScoreBadge from "@/components/ScoreBadge";
import TranscriptPanel from "@/components/TranscriptPanel";
import WorstSentencesPanel from "@/components/WorstSentencesPanel";
import ChecklistPanel from "@/components/ChecklistPanel";
import RecommendedScript from "@/components/RecommendedScript";

// Phase 1: resolve a report bundle from the in-memory store, falling back to the
// demo fixture. Phase 2 swaps this for the GET /api/reports/:id Insforge read.
function resolveBundle(id: string): ReportBundle {
  const demo = loadDemoBundle();
  if (id === demo.report?.report_id) return demo;

  const report = getReport(id);
  if (!report) return demo; // graceful fallback so the dashboard always renders
  const call = getCall(report.call_id);
  const business = call ? getBusiness(call.business_id) : null;
  const scenario = call ? getScenario(call.scenario_id) : null;
  return { business, scenario, call, report };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business, scenario, call, report } = resolveBundle(id);

  return (
    <div className="stack">
      <section className="spread">
        <div>
          <Link href="/" className="muted">
            ← Back
          </Link>
          <h1 style={{ marginTop: 8 }}>Scout.ai report</h1>
        </div>
        <ScoreBadge
          score={report?.overall_score}
          category={report?.score_category}
        />
      </section>

      <CallSummaryCard business={business} scenario={scenario} call={call} />

      {report?.summary && (
        <div className="card">
          <div className="panel-label">Summary</div>
          <p style={{ margin: 0 }}>{report.summary}</p>
        </div>
      )}

      <div className="grid grid-2">
        <TranscriptPanel
          transcript={call?.transcript}
          worstSentences={report?.worst_sentences}
        />
        <div className="stack">
          <ChecklistPanel checklist={report?.lead_capture_checklist} />
          <RecommendedScript
            script={report?.recommended_staff_script}
            trainingPriority={report?.top_training_priority}
          />
        </div>
      </div>

      <WorstSentencesPanel worstSentences={report?.worst_sentences} />
    </div>
  );
}
