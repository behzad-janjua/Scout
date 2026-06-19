import Link from "next/link";
import type { ReportBundle } from "@/lib/types";
import { loadDemoBundle } from "@/lib/fixtures";
import { getReportBundle } from "@/lib/data";
import CallSummaryCard from "@/components/CallSummaryCard";
import ScoreBadge from "@/components/ScoreBadge";
import CategoryScores from "@/components/CategoryScores";
import TranscriptPanel from "@/components/TranscriptPanel";
import WorstSentencesPanel from "@/components/WorstSentencesPanel";
import RevenueMoments from "@/components/RevenueMoments";
import ChecklistPanel from "@/components/ChecklistPanel";
import RecommendedScript from "@/components/RecommendedScript";

// Resolve a report bundle from the data layer (Insforge or in-memory), falling
// back to the demo fixture so the dashboard always renders something useful.
async function resolveBundle(id: string): Promise<ReportBundle> {
  const demo = loadDemoBundle();
  if (id === demo.report?.report_id) return demo;

  const bundle = await getReportBundle(id);
  if (!bundle.report) return demo; // graceful fallback for the demo
  return bundle;
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business, scenario, call, report } = await resolveBundle(id);

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

      <CallSummaryCard
        business={business}
        scenario={scenario}
        call={call}
        report={report}
      />

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
          <CategoryScores scores={report?.category_scores} />
          <ChecklistPanel checklist={report?.lead_capture_checklist} />
        </div>
      </div>

      <RevenueMoments
        whatWentWell={report?.what_went_well}
        missedRevenueMoments={report?.missed_revenue_moments}
      />

      <WorstSentencesPanel worstSentences={report?.worst_sentences} />

      <RecommendedScript
        script={report?.recommended_staff_script}
        trainingPriority={report?.top_training_priority}
      />
    </div>
  );
}
