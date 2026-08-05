import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await getDb().listSessions(auth.userId);
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    const title =
      typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : undefined;

    const session = await getDb().createSession(auth.userId, title, description);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}