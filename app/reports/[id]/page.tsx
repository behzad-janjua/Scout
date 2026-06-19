import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReportBundle } from "@/lib/types";
import { getReportBundle } from "@/lib/data";
import ReportDashboard from "@/components/ReportDashboard";

async function resolveBundle(id: string): Promise<ReportBundle> {
  const bundle = await getReportBundle(id);
  return bundle;
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await resolveBundle(id);
  if (!bundle.report) notFound();

  return <ReportDashboard bundle={bundle} />;
}
