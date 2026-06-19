import Link from "next/link";
import type { ReportBundle } from "@/lib/types";
import CallSummaryCard from "@/components/CallSummaryCard";
import ScoreBadge from "@/components/ScoreBadge";
import CategoryScores from "@/components/CategoryScores";
import TranscriptPanel from "@/components/TranscriptPanel";
import WorstSentencesPanel from "@/components/WorstSentencesPanel";
import RevenueMoments from "@/components/RevenueMoments";
import ChecklistPanel from "@/components/ChecklistPanel";
import RecommendedScript from "@/components/RecommendedScript";

export default function ReportDashboard({
  bundle,
  eyebrow = "Scout.ai report",
  title = "Scout.ai report",
  description,
}: {
  bundle: ReportBundle;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const { business, scenario, call, report } = bundle;

  return (
    <div className="stack">
      <section className="spread">
        <div>
          <Link href="/" className="muted">
            ← Back
          </Link>
          <div className="panel-label" style={{ marginTop: 10 }}>
            {eyebrow}
          </div>
          <h1 style={{ marginTop: 4 }}>{title}</h1>
          {description && (
            <p className="lede" style={{ marginBottom: 0 }}>
              {description}
            </p>
          )}
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
        <div className="card report-summary">
          <div>
            <div className="panel-label">Owner takeaway</div>
            <p style={{ margin: 0 }}>{report.summary}</p>
          </div>
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
