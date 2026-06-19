// Phase 1 placeholder data store.
// Phase 2 replaces this with Insforge-backed read/write functions, keeping the
// same function signatures so API routes don't need to change.
import type { Business, Call, Report, Scenario } from "./types";

interface DB {
  businesses: Map<string, Business>;
  scenarios: Map<string, Scenario>;
  calls: Map<string, Call>;
  reports: Map<string, Report>;
}

// Survive Next.js dev hot-reloads by stashing on globalThis.
const g = globalThis as unknown as { __scoutDB?: DB };
const db: DB =
  g.__scoutDB ??
  (g.__scoutDB = {
    businesses: new Map(),
    scenarios: new Map(),
    calls: new Map(),
    reports: new Map(),
  });

export function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// businesses
export function createBusiness(b: Business): Business {
  db.businesses.set(b.id, b);
  return b;
}
export function getBusiness(id: string): Business | null {
  return db.businesses.get(id) ?? null;
}

// scenarios
export function createScenario(s: Scenario): Scenario {
  db.scenarios.set(s.id, s);
  return s;
}
export function getScenario(id: string): Scenario | null {
  return db.scenarios.get(id) ?? null;
}

// calls
export function createCall(c: Call): Call {
  db.calls.set(c.id, c);
  return c;
}
export function getCall(id: string): Call | null {
  return db.calls.get(id) ?? null;
}
export function getCallByVapiId(vapiId: string): Call | null {
  for (const c of db.calls.values()) {
    if (c.vapi_call_id === vapiId) return c;
  }
  return null;
}

// reports
export function createReport(r: Report): Report {
  db.reports.set(r.report_id, r);
  return r;
}
export function getReport(id: string): Report | null {
  return db.reports.get(id) ?? null;
}
export function getReportByCallId(callId: string): Report | null {
  for (const r of db.reports.values()) {
    if (r.call_id === callId) return r;
  }
  return null;
}
