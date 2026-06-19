import type { WorstSentence } from "@/lib/types";
import { DASHBOARD_COPY } from "@/lib/dashboard-copy";

// Splits a raw transcript into speaker-labelled lines and highlights any line
// that contains a flagged "worst sentence".
function parseLines(transcript: string) {
  return transcript
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:]{1,30}):\s*(.*)$/);
      return m
        ? { speaker: m[1], text: m[2] }
        : { speaker: "", text: line };
    });
}

export default function TranscriptPanel({
  transcript,
  worstSentences = [],
}: {
  transcript?: string | null;
  worstSentences?: WorstSentence[];
}) {
  const flagged = new Set(
    worstSentences.map((w) => w.exact_sentence.trim().toLowerCase())
  );

  return (
    <div className="card">
      <div className="panel-label">
        {DASHBOARD_COPY.headings.callTranscript}
      </div>
      {transcript ? (
        <div>
          {parseLines(transcript).map((line, i) => {
            const isFlagged = flagged.has(line.text.trim().toLowerCase());
            return (
              <div
                key={i}
                className="transcript-line"
                style={
                  isFlagged
                    ? {
                        background: "color-mix(in srgb, var(--danger) 10%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--danger) 30%, var(--border))",
                        borderRadius: 6,
                        padding: "4px 8px",
                        margin: "2px 0",
                      }
                    : undefined
                }
              >
                {line.speaker && (
                  <span className="speaker">{line.speaker}:</span>
                )}
                <span>{line.text}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="placeholder">{DASHBOARD_COPY.emptyStates.transcript}</p>
      )}
    </div>
  );
}
