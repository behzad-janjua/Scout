import { NextResponse } from "next/server";
import { getCall } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const call = await getCall(id);
  if (!call) {
    return NextResponse.json({ error: "call not found" }, { status: 404 });
  }
  return NextResponse.json(call);
}
