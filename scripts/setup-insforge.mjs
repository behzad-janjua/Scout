// Creates the Scout.ai database tables in Insforge.
// Run once after putting INSFORGE_API_URL + INSFORGE_API_KEY in .env:
//   npm run setup:db
//
// Idempotent: a table that already exists is skipped. After creating, it prints
// each table's actual schema so we can confirm Insforge's auto-injected columns
// (id / created_at) match what the app expects.
import process from "node:process";

const BASE = process.env.INSFORGE_API_URL;
const KEY = process.env.INSFORGE_API_KEY;

if (!BASE || !KEY) {
  console.error(
    "Missing INSFORGE_API_URL or INSFORGE_API_KEY. Add them to .env and run with: npm run setup:db"
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": KEY,
};

// Column shorthand. id / created_at are intentionally omitted — Insforge
// auto-generates them. The create-table API expects columnName/isNullable/
// isUnique (note: the get-schema *response* uses name/nullable/unique instead).
const col = (columnName, type, { nullable = true, unique = false } = {}) => ({
  columnName,
  type,
  isNullable: nullable,
  isUnique: unique,
});

const tables = [
  {
    tableName: "businesses",
    columns: [
      col("name", "string", { nullable: false }),
      col("business_type", "string", { nullable: false }),
      col("phone_number", "string"),
      col("owner_email", "string"),
      col("location", "string"),
    ],
  },
  {
    tableName: "scenarios",
    columns: [
      col("business_id", "string", { nullable: false }),
      col("title", "string", { nullable: false }),
      col("description", "string"),
      col("goal", "string"),
      col("customer_persona", "string"),
      col("questions_to_ask", "json"),
    ],
  },
  {
    tableName: "calls",
    columns: [
      col("business_id", "string"),
      col("scenario_id", "string"),
      col("provider", "string"),
      col("vapi_call_id", "string"),
      col("status", "string", { nullable: false }),
      col("started_at", "datetime"),
      col("ended_at", "datetime"),
      col("duration_seconds", "integer"),
      col("recording_url", "string"),
      col("transcript", "string"),
      col("failure_reason", "string"),
    ],
  },
  {
    tableName: "reports",
    columns: [
      col("call_id", "string", { nullable: false }),
      col("overall_score", "integer", { nullable: false }),
      col("score_category", "string", { nullable: false }),
      col("outcome", "string", { nullable: false }),
      col("customer_intent", "string", { nullable: false }),
      col("summary", "string"),
      col("category_scores", "json"),
      col("what_went_well", "json"),
      col("worst_sentences", "json"),
      col("missed_revenue_moments", "json"),
      col("lead_capture_checklist", "json"),
      col("recommended_staff_script", "string"),
      col("top_training_priority", "string"),
    ],
  },
];

async function createTable(spec) {
  const res = await fetch(`${BASE}/api/database/tables`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...spec, rlsEnabled: false }),
  });
  const text = await res.text();
  if (res.ok) {
    console.log(`✓ created table: ${spec.tableName}`);
    return;
  }
  // Treat "already exists" as success so the script is re-runnable.
  if (res.status === 409 || /exist/i.test(text)) {
    console.log(`• table already exists: ${spec.tableName}`);
    return;
  }
  console.error(`✗ failed to create ${spec.tableName} (${res.status}): ${text}`);
}

async function printSchema(tableName) {
  const res = await fetch(
    `${BASE}/api/database/tables/${tableName}/schema`,
    { headers }
  );
  if (!res.ok) return;
  const schema = await res.json().catch(() => null);
  const cols =
    schema?.columns
      ?.map((c) => `${c.columnName ?? c.name}:${c.type}`)
      .join(", ") ?? "(unknown)";
  console.log(`  ${tableName} → ${cols}`);
}

async function main() {
  console.log(`Setting up Scout.ai tables on ${BASE}\n`);
  for (const spec of tables) {
    await createTable(spec);
  }
  console.log("\nResulting schemas:");
  for (const spec of tables) {
    await printSchema(spec.tableName);
  }
  console.log("\nDone. Next: npm run seed:db");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
