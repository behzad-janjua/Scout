import { NextResponse } from "next/server";
import type { ReportBundle } from "@/lib/types";
import { loadDemoBundle } from "@/lib/fixtures";
import { getReport, getCall, getBusiness, getScenario } from "@/lib/store";

// GET /api/reports/:id — returns the full bundle (business + scenario + call +
// report) needed to render the dashboard. Falls back to the demo fixture so the
// demo path always returns a complete report.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const demo = loadDemoBundle();
  if (id === demo.report?.report_id) {
    return NextResponse.json(demo);
  }

  const report = getReport(id);
  if (!report) {
    return NextResponse.json({ error: "report not found" }, { status: 404 });
  }
  const call = getCall(report.call_id);
  const business = call ? getBusiness(call.business_id) : null;
  const scenario = call ? getScenario(call.scenario_id) : null;

  const bundle: ReportBundle = { business, scenario, call, report };
  return NextResponse.json(bundle);
}
