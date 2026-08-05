import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function resolveSession(
  req: NextRequest,
  params: Promise<{ id: string }>
) {
  const auth = authUser(req);
  if (!auth) return null;
  const { id } = await params;
  return { auth, sessionId: id };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const resolved = await resolveSession(req, ctx.params);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { auth, sessionId } = resolved;
    const session = await getDb().getSession(sessionId);
    if (!session || session.user_id !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await getDb().listMessages(sessionId);
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const resolved = await resolveSession(req, ctx.params);
  if (!resolved) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { auth, sessionId } = resolved;
    const session = await getDb().getSession(sessionId);
    if (!session || session.user_id !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      role?: unknown;
      content?: unknown;
      metadata?: unknown;
    };

    const role = body.role;
    const content = body.content;
    if (role !== "user" && role !== "assistant") {
      return NextResponse.json(
        { error: "role must be 'user' or 'assistant'" },
        { status: 400 }
      );
    }
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    const message = await getDb().createMessage(
      sessionId,
      role,
      content.trim(),
      (body.metadata ?? null) as Record<string, unknown> | null
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}