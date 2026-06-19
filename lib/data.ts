// Unified async data-access layer for Scout.ai.
//
// When INSFORGE_API_URL + INSFORGE_API_KEY are set, reads/writes go to Insforge
// (Postgres via PostgREST). Otherwise everything falls back to an in-memory
// store so the app and the demo path keep working with no backend.
//
// Records are inserted WITHOUT id/created_at — Insforge auto-generates those and
// the inserted row (with its id) is read back. The in-memory fallback mirrors
// that behaviour so the two paths are interchangeable.
import { createAdminClient } from "@insforge/sdk";
import type {
  Business,
  Call,
  Report,
  Scenario,
  ReportBundle,
} from "./types";

const BASE = process.env.INSFORGE_API_URL;
const KEY = process.env.INSFORGE_API_KEY;
export const usingInsforge = Boolean(BASE && KEY);

type Client = ReturnType<typeof createAdminClient>;
let _client: Client | null = null;
function client(): Client {
  if (!_client) {
    _client = createAdminClient({ baseUrl: BASE!, apiKey: KEY! });
  }
  return _client;
}

// --- Insforge helpers ------------------------------------------------------

async function insforgeInsert<T>(table: string, row: Record<string, unknown>) {
  // Chain .select() so Insforge returns the inserted row (with its auto id /
  // created_at); a bare insert returns an empty data array.
  const { data, error } = await client()
    .database.from(table)
    .insert([row])
    .select();
  if (error) throw new Error(`[insforge:${table}.insert] ${error.message}`);
  const rows = (data as unknown as T[]) ?? [];
  return rows[0];
}

async function insforgeSelectOne<T>(
  table: string,
  column: string,
  value: string
) {
  const { data, error } = await client()
    .database.from(table)
    .select("*")
    .eq(column, value);
  if (error) throw new Error(`[insforge:${table}.select] ${error.message}`);
  const rows = (data as unknown as T[]) ?? [];
  return rows[0] ?? null;
}

// --- In-memory fallback ----------------------------------------------------

interface Mem {
  businesses: Map<string, Business>;
  scenarios: Map<string, Scenario>;
  calls: Map<string, Call>;
  reports: Map<string, Report>;
}
const g = globalThis as unknown as { __scoutMem?: Mem };
const mem: Mem =
  g.__scoutMem ??
  (g.__scoutMem = {
    businesses: new Map(),
    scenarios: new Map(),
    calls: new Map(),
    reports: new Map(),
  });

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function now(): string {
  return new Date().toISOString();
}

// --- Businesses ------------------------------------------------------------

export async function createBusiness(
  input: Omit<Business, "id" | "created_at">
): Promise<Business> {
  if (usingInsforge) return insforgeInsert<Business>("businesses", input);
  const business: Business = { ...input, id: genId("biz"), created_at: now() };
  mem.businesses.set(business.id, business);
  return business;
}

export async function getBusiness(id: string): Promise<Business | null> {
  if (usingInsforge) return insforgeSelectOne<Business>("businesses", "id", id);
  return mem.businesses.get(id) ?? null;
}

// --- Scenarios -------------------------------------------------------------

export async function createScenario(
  input: Omit<Scenario, "id" | "created_at">
): Promise<Scenario> {
  if (usingInsforge) return insforgeInsert<Scenario>("scenarios", input);
  const scenario: Scenario = {
    ...input,
    id: genId("scenario"),
    created_at: now(),
  };
  mem.scenarios.set(scenario.id, scenario);
  return scenario;
}

export async function getScenario(id: string): Promise<Scenario | null> {
  if (usingInsforge) return insforgeSelectOne<Scenario>("scenarios", "id", id);
  return mem.scenarios.get(id) ?? null;
}

// --- Calls -----------------------------------------------------------------

export async function createCall(
  input: Omit<Call, "id" | "created_at">
): Promise<Call> {
  if (usingInsforge) return insforgeInsert<Call>("calls", input);
  const call: Call = { ...input, id: genId("call"), created_at: now() };
  mem.calls.set(call.id, call);
  return call;
}

export async function getCall(id: string): Promise<Call | null> {
  if (usingInsforge) return insforgeSelectOne<Call>("calls", "id", id);
  return mem.calls.get(id) ?? null;
}

export async function getCallByVapiId(vapiId: string): Promise<Call | null> {
  if (usingInsforge)
    return insforgeSelectOne<Call>("calls", "vapi_call_id", vapiId);
  for (const c of mem.calls.values()) {
    if (c.vapi_call_id === vapiId) return c;
  }
  return null;
}

// Patch a call in place. Only the provided fields are changed; the updated row
// is returned. Used by the Vapi webhook to fill in status/transcript/recording
// as call events arrive.
export async function updateCall(
  id: string,
  patch: Partial<Omit<Call, "id" | "created_at">>
): Promise<Call | null> {
  if (usingInsforge) {
    const { data, error } = await client()
      .database.from("calls")
      .update(patch)
      .eq("id", id)
      .select();
    if (error) throw new Error(`[insforge:calls.update] ${error.message}`);
    const rows = (data as unknown as Call[]) ?? [];
    return rows[0] ?? null;
  }
  const existing = mem.calls.get(id);
  if (!existing) return null;
  const updated: Call = { ...existing, ...patch };
  mem.calls.set(id, updated);
  return updated;
}

// --- Reports ---------------------------------------------------------------
// Insforge uses the row's own `id` as the report id; we expose it as report_id.

export async function createReport(
  input: Omit<Report, "report_id" | "created_at">
): Promise<Report> {
  if (usingInsforge) {
    const row = await insforgeInsert<Record<string, unknown>>(
      "reports",
      input
    );
    return { ...(row as object), report_id: (row as { id: string }).id } as Report;
  }
  const report: Report = {
    ...input,
    report_id: genId("report"),
    created_at: now(),
  };
  mem.reports.set(report.report_id, report);
  return report;
}

export async function getReport(id: string): Promise<Report | null> {
  if (usingInsforge) {
    const row = await insforgeSelectOne<Record<string, unknown>>(
      "reports",
      "id",
      id
    );
    if (!row) return null;
    return { ...(row as object), report_id: (row as { id: string }).id } as Report;
  }
  return mem.reports.get(id) ?? null;
}

// List all reports, newest first. Used by the reports index page.
export async function listReports(): Promise<Report[]> {
  if (usingInsforge) {
    const { data, error } = await client()
      .database.from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`[insforge:reports.list] ${error.message}`);
    const rows = (data as unknown as Record<string, unknown>[]) ?? [];
    return rows.map(
      (row) =>
        ({ ...(row as object), report_id: (row as { id: string }).id }) as Report
    );
  }
  return [...mem.reports.values()].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? "")
  );
}

// --- Bundle ----------------------------------------------------------------

export async function getReportBundle(reportId: string): Promise<ReportBundle> {
  const report = await getReport(reportId);
  if (!report) return { business: null, scenario: null, call: null, report: null };
  const call = await getCall(report.call_id);
  const business = call ? await getBusiness(call.business_id) : null;
  const scenario = call ? await getScenario(call.scenario_id) : null;
  return { business, scenario, call, report };
}
