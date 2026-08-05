import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getDb().getUserById(payload.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}