// Loads Person B's reference fixtures for docs, rehearsal, and local checks.
import fs from "fs";
import path from "path";
import type { Business, Call, Report, Scenario, ReportBundle } from "./types";

const FIXTURES_DIR = path.join(process.cwd(), "fixtures");

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(path.join(FIXTURES_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

export function loadSampleTranscript(): string {
  return fs.readFileSync(
    path.join(FIXTURES_DIR, "sample-transcript-bike-shop.txt"),
    "utf-8"
  );
}

export function loadSampleAnalysis(): Report {
  return readJson<Report>("sample-analysis-output.json");
}

interface SampleRecords {
  business: Business;
  scenario: Scenario;
  call: Call & { transcript_path?: string };
  report: { id: string; call_id: string; analysis_path?: string };
}

export function loadSampleRecords(): SampleRecords {
  return readJson<SampleRecords>("sample-records.json");
}

// Fully assembled reference bundle.
export function loadDemoBundle(): ReportBundle {
  const records = loadSampleRecords();
  const transcript = loadSampleTranscript();
  const report = loadSampleAnalysis();

  const call: Call = {
    id: records.call.id,
    business_id: records.call.business_id,
    scenario_id: records.call.scenario_id,
    provider: records.call.provider,
    vapi_call_id: records.call.vapi_call_id,
    status: records.call.status,
    started_at: records.call.started_at,
    ended_at: records.call.ended_at,
    duration_seconds: records.call.duration_seconds,
    recording_url: records.call.recording_url,
    transcript,
  };

  return {
    business: records.business,
    scenario: records.scenario,
    call,
    report,
  };
}
