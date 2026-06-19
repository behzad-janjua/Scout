import type { ScoreCategory } from "@/lib/types";
import { SCORE_CATEGORY_LABEL } from "@/lib/types";

export default function ScoreBadge({
  score,
  category,
}: {
  score?: number;
  category?: ScoreCategory;
}) {
  if (score == null || category == null) {
    return <div className="score-badge">—</div>;
  }
  return (
    <div className="row">
      <div className={`score-badge cat-${category}`}>
        <span className="num">{score}</span>
        <span className="of">/ 100</span>
      </div>
      <div>
        <div className="panel-label">Overall</div>
        <strong>{SCORE_CATEGORY_LABEL[category]}</strong>
      </div>
    </div>
  );
}
