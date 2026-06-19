import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-wrap">
      <div className="hero-centered">
        <h1 className="hero-title">
          Is your staff{" "}
          <span className="hero-accent">losing you sales</span>
          {" "}on every phone call?
        </h1>
        <p className="hero-sub">
          Scout calls your bike shop like a real customer with a real complaint,
          scores the entire conversation, and shows you the exact sentences that
          cost you trust and revenue.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-hero" href="/create">
            Start a free test
          </Link>
          <Link className="btn btn-ghost" href="/reports/sample">
            See a sample report
          </Link>
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-card">
          <div className="feature-tag">Score</div>
          <div className="feature-title">Know exactly how the call went</div>
          <div className="feature-desc">
            A 0&ndash;100 rating across greeting, helpfulness, lead capture, and
            closing. No guessing, no gut feelings.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-tag">Transcript</div>
          <div className="feature-title">Find the sentences that lost the sale</div>
          <div className="feature-desc">
            Every weak line pulled from the transcript, quoted exactly, with a
            plain-English explanation of what went wrong.
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-tag">Script</div>
          <div className="feature-title">Walk away with better words</div>
          <div className="feature-desc">
            Word-for-word replacements your staff can use on the very next call.
            No training session required.
          </div>
        </div>
      </div>
    </div>
  );
}
