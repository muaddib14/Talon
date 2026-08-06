import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface WorkerResult {
  text: string;
  files: { path: string; content: string }[];
  commands: { command: string; stdout: string; stderr: string; exitCode: number }[];
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerUrl = process.env.WORKER_URL;
  const workerSecret = process.env.WORKER_SHARED_SECRET;
  if (!workerUrl || !workerSecret) {
    return NextResponse.json(
      { error: "Sandbox execution is not configured on this server." },
      { status: 503 }
    );
  }

  const apiKey = req.headers.get("x-llm-api-key");
  const baseUrl = req.headers.get("x-llm-base-url")?.trim();
  const model = req.headers.get("x-llm-model")?.trim();
  const format = req.headers.get("x-llm-format") === "openai" ? "openai" : "anthropic";

  if (!apiKey || !baseUrl || !model) {
    return NextResponse.json(
      { error: "Missing API key/model. Add one in Settings first." },
      { status: 400 }
    );
  }

  try {
    const { id: sessionId } = await ctx.params;
    const session = await getDb().getSession(sessionId);
    if (!session || session.user_id !== auth.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await req.json()) as { prompt?: unknown };
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const upstream = await fetch(`${workerUrl.replace(/\/$/, "")}/process`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-worker-secret": workerSecret,
      },
      body: JSON.stringify({ sessionId, prompt, apiKey, baseUrl, model, format }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: `Sandbox run failed (${upstream.status}).`, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    const result = (await upstream.json()) as WorkerResult;

    const plan = result.commands.map(
      (c) => `Ran \`${c.command}\` (exit ${c.exitCode})`
    );

    const message = await getDb().createMessage(
      sessionId,
      "assistant",
      result.text || "Done.",
      { plan, files: result.files, commands: result.commands }
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to run sandbox session" },
      { status: 500 }
    );
  }
}
