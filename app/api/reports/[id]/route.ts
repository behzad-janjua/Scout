import { NextResponse } from "next/server";
import { loadDemoBundle } from "@/lib/fixtures";
import { getReportBundle } from "@/lib/data";

// GET /api/reports/:id — returns the full bundle (business + scenario + call +
// report) needed to render the dashboard. The fixed demo id is served from the
// fixture so the demo path always returns a complete report.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const demo = loadDemoBundle();
  if (id === demo.report?.report_id) {
    return NextResponse.json(demo);
  }

  const bundle = await getReportBundle(id);
  if (!bundle.report) {
    return NextResponse.json({ error: "report not found" }, { status: 404 });
  }
  return NextResponse.json(bundle);
}
