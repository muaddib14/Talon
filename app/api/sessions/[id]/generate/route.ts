import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authUser } from "@/lib/auth";
import { getDb } from "@/lib/db";

const SYSTEM_PROMPT = `You are Talon, an AI coding agent. A user describes an app or a change.
Respond with a single JSON object only — no markdown fences, no prose outside the JSON.

Shape:
{
  "text": "short conversational reply, 1-3 sentences",
  "plan": ["step 1", "step 2", "..."],
  "files": [{ "path": "index.html", "content": "full file contents" }]
}

Rules:
- "files" contain complete, working, plain HTML/CSS/JS (no build step) unless the user asks for something else.
- Keep "text" short and conversational, like a message to the user, not a report.
- "plan" is 3-6 short completed steps describing what you built.
- Always return valid JSON that can be parsed with JSON.parse.`;

interface GeneratedReply {
  text: string;
  plan: string[];
  files: { path: string; content: string }[];
}

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

function parseJsonLoose(raw: string): unknown {
  const cleaned = raw
    .replace(/\n?data:\s*\[DONE\]\s*$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function extractJson(raw: string): GeneratedReply | null {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;

  try {
    const parsed = JSON.parse(candidate);
    if (
      typeof parsed.text === "string" &&
      Array.isArray(parsed.plan) &&
      Array.isArray(parsed.files)
    ) {
      return parsed as GeneratedReply;
    }
  } catch {
    /* fall through */
  }
  return null;
}

async function callAnthropic(
  baseUrl: string,
  apiKey: string,
  model: string,
  conversation: ConversationTurn[]
) {
  const cleanBase = baseUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
  const res = await fetch(`${cleanBase}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: conversation,
    }),
  });

  if (!res.ok) return { ok: false as const, res };

  const raw = await res.text();
  try {
    const data = parseJsonLoose(raw) as {
      content?: { type: string; text?: string }[];
    };
    const text =
      data?.content?.find((b) => b.type === "text")?.text ?? "";
    return { ok: true as const, text };
  } catch {
    return { ok: false as const, res, parseFailure: raw };
  }
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  conversation: ConversationTurn[]
) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const url = cleanBase.endsWith("/v1")
    ? `${cleanBase}/chat/completions`
    : `${cleanBase}/v1/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversation,
      ],
    }),
  });

  if (!res.ok) return { ok: false as const, res };

  const raw = await res.text();
  try {
    const data = parseJsonLoose(raw) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data?.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, text };
  } catch {
    return { ok: false as const, res, parseFailure: raw };
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = authUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = req.headers.get("x-llm-api-key");
  const baseUrl =
    req.headers.get("x-llm-base-url")?.trim() || "https://api.anthropic.com";
  const model =
    req.headers.get("x-llm-model")?.trim() || "claude-sonnet-4-5-20250929";
  const format = req.headers.get("x-llm-format") === "openai" ? "openai" : "anthropic";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API key. Add one in Settings first." },
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

    const history = await getDb().listMessages(sessionId);
    const conversation: ConversationTurn[] = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));
    conversation.push({ role: "user", content: prompt });

    const result =
      format === "openai"
        ? await callOpenAiCompatible(baseUrl, apiKey, model, conversation)
        : await callAnthropic(baseUrl, apiKey, model, conversation);

    if (!result.ok) {
      const errBody: string =
        "parseFailure" in result
          ? (result.parseFailure ?? "")
          : await result.res.text().catch(() => "");
      return NextResponse.json(
        {
          error:
            "parseFailure" in result
              ? "Model provider returned a response we couldn't parse as JSON."
              : `Model provider error (${result.res.status}). Check your API key, base URL, and model name.`,
          detail: errBody.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const parsed = extractJson(result.text);

    const message = await getDb().createMessage(
      sessionId,
      "assistant",
      parsed?.text ?? (result.text || "Done."),
      parsed ? { plan: parsed.plan, files: parsed.files } : null
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
      { status: 500 }
    );
  }
}
