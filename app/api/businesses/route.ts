import { NextResponse } from "next/server";
import { createBusiness, id } from "@/lib/store";
import type { Business } from "@/lib/types";

// POST /api/businesses — create a business record.
// Phase 2: persist to Insforge instead of the in-memory store.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const business: Business = {
    id: id("biz"),
    name: body.name,
    business_type: body.business_type ?? "other",
    phone_number: body.phone_number ?? "",
    owner_email: body.owner_email || undefined,
    location: body.location || undefined,
    created_at: new Date().toISOString(),
  };
  createBusiness(business);
  return NextResponse.json(business, { status: 201 });
}
