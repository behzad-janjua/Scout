import ReportDashboard from "@/components/ReportDashboard";
import { loadDemoBundle } from "@/lib/fixtures";

export default function SampleReportPage() {
  const bundle = loadDemoBundle();

  return (
    <ReportDashboard
      bundle={bundle}
      eyebrow="Sample completed report"
      title="What Scout.ai shows after a call"
      description="A representative Nebius-style analysis using a completed mystery call. Live reports use the same structure with the actual transcript."
    />
  );
}
