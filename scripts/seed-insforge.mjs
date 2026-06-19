// Seeds Insforge with the demo bike-shop record set so a complete report is
// stored in the database (not just served from fixtures).
// Run after setup:db:  npm run seed:db
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createAdminClient } from "@insforge/sdk";

const BASE = process.env.INSFORGE_API_URL;
const KEY = process.env.INSFORGE_API_KEY;
if (!BASE || !KEY) {
  console.error("Missing INSFORGE_API_URL or INSFORGE_API_KEY in .env.");
  process.exit(1);
}

const root = process.cwd();
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf-8"));
const records = readJson("fixtures/sample-records.json");
const analysis = readJson("fixtures/sample-analysis-output.json");
const transcript = fs.readFileSync(
  path.join(root, "fixtures/sample-transcript-bike-shop.txt"),
  "utf-8"
);

const db = createAdminClient({ baseUrl: BASE, apiKey: KEY }).database;

async function insert(table, row) {
  // .select() returns the inserted row (with its auto-generated id).
  const { data, error } = await db.from(table).insert([row]).select();
  if (error) throw new Error(`${table}.insert: ${error.message}`);
  return data[0];
}

async function main() {
  const b = records.business;
  const s = records.scenario;
  const c = records.call;

  const business = await insert("businesses", {
    name: b.name,
    business_type: b.business_type,
    phone_number: b.phone_number,
    location: b.location ?? null,
  });
  console.log("✓ business:", business.id);

  const scenario = await insert("scenarios", {
    business_id: business.id,
    title: s.title,
    goal: s.goal,
    customer_persona: s.customer_persona,
    questions_to_ask: s.questions_to_ask,
  });
  console.log("✓ scenario:", scenario.id);

  const call = await insert("calls", {
    business_id: business.id,
    scenario_id: scenario.id,
    provider: c.provider,
    vapi_call_id: c.vapi_call_id,
    status: c.status,
    started_at: c.started_at,
    ended_at: c.ended_at,
    duration_seconds: c.duration_seconds,
    recording_url: c.recording_url,
    transcript, // <-- sample transcript stored in calls
  });
  console.log("✓ call:", call.id);

  // Strip the fixture's own ids; the DB assigns its own.
  const { report_id: _r, call_id: _c, ...analysisFields } = analysis;
  const report = await insert("reports", {
    ...analysisFields,
    call_id: call.id, // <-- sample analysis stored in reports, linked to the call
  });
  console.log("✓ report:", report.id);

  console.log(`\nSeeded. View it at: /reports/${report.id}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
