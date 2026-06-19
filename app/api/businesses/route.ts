import { NextResponse } from "next/server";
import { createBusiness } from "@/lib/data";

// POST /api/businesses — create a business record (Insforge or in-memory).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body?.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const business = await createBusiness({
    name: body.name,
    business_type: body.business_type ?? "other",
    phone_number: body.phone_number ?? "",
    owner_email: body.owner_email || undefined,
    location: body.location || undefined,
  });
  return NextResponse.json(business, { status: 201 });
}
