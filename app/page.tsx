import Link from "next/link";

export default function HomePage() {
  return (
    <div className="stack">
      <section>
        <span className="tag">AI secret shopper for phone calls</span>
        <h1 style={{ marginTop: 12 }}>
          Find out whether your phone calls are making money — or losing
          customers.
        </h1>
        <p className="lede">
          Scout.ai calls your business like a real customer, scores the
          experience, and shows you exactly which sentences lost the sale.
        </p>
        <div className="btn-row">
          <Link className="btn" href="/create">
            Run a mystery call test
          </Link>
        </div>
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="panel-label">How it works</div>
          <ol className="clean">
            <li>Create a business + a realistic test scenario.</li>
            <li>Vapi places an AI mystery shopper call.</li>
            <li>The transcript is captured and stored in Insforge.</li>
            <li>Nebius analyzes the call and scores conversion.</li>
            <li>You get a coaching report with better scripts.</li>
          </ol>
        </div>
        <div className="card">
          <div className="panel-label">Powered by</div>
          <ul className="clean">
            <li>
              <strong>Vapi</strong> — realistic voice mystery-shopper calls
            </li>
            <li>
              <strong>Nebius</strong> — transcript analysis &amp; coaching
            </li>
            <li>
              <strong>Insforge</strong> — backend, storage &amp; dashboard data
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
