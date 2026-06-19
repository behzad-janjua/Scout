import { NextResponse } from "next/server";
import { getReportBundle } from "@/lib/data";

// GET /api/reports/:id — returns the full bundle (business + scenario + call +
// report) needed to render the dashboard.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const bundle = await getReportBundle(id);
  if (!bundle.report) {
    return NextResponse.json({ error: "report not found" }, { status: 404 });
  }
  return NextResponse.json(bundle);
}
