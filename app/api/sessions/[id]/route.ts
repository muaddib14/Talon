import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const session = await getDb().getSession(id);

    if (!session || session.user_id !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const session = await getDb().getSession(id);

    if (!session || session.user_id !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await req.json()) as { title?: unknown };
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const updated = await getDb().renameSession(auth.userId, id, title);
    if (!updated) {
      return NextResponse.json({ error: "Failed to rename session" }, { status: 500 });
    }

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to rename session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const session = await getDb().getSession(id);

    if (!session || session.user_id !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await getDb().deleteSession(auth.userId, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}