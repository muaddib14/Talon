import { toAnthropicTools, toOpenAiTools } from "./tools/index.js";

export type LlmFormat = "anthropic" | "openai";

export interface LlmSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  format: LlmFormat;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

/** Provider-neutral message shape the agent loop works with. */
export type NeutralMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; text: string; toolCalls: ToolCall[] }
  | { role: "tool_result"; toolCallId: string; name: string; output: unknown };

export interface LlmReply {
  text: string;
  toolCalls: ToolCall[];
}

const SYSTEM_PROMPT = `You are Talon, an AI coding agent with real sandbox access.
Use the write_file tool to create files and run_command to execute shell commands.
Work step by step: write files first, then run commands to verify (e.g. check the file exists, run a linter, etc).
When the task is complete, reply with a short summary and stop calling tools.`;

export async function callLlm(
  history: NeutralMessage[],
  settings: LlmSettings
): Promise<LlmReply> {
  return settings.format === "openai"
    ? callOpenAi(history, settings)
    : callAnthropic(history, settings);
}

async function callAnthropic(
  history: NeutralMessage[],
  { apiKey, baseUrl, model }: LlmSettings
): Promise<LlmReply> {
  const messages: unknown[] = [];

  for (const m of history) {
    if (m.role === "user") {
      messages.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      const content: unknown[] = [];
      if (m.text) content.push({ type: "text", text: m.text });
      for (const tc of m.toolCalls) {
        content.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.input });
      }
      messages.push({ role: "assistant", content });
    } else if (m.role === "tool_result") {
      // Anthropic groups tool_results into a single user message; merge with previous if adjacent.
      const last = messages[messages.length - 1] as
        | { role: string; content: unknown[] }
        | undefined;
      const block = {
        type: "tool_result",
        tool_use_id: m.toolCallId,
        content: JSON.stringify(m.output),
      };
      if (last?.role === "user" && Array.isArray(last.content) && last.content[0] && (last.content[0] as { type: string }).type === "tool_result") {
        last.content.push(block);
      } else {
        messages.push({ role: "user", content: [block] });
      }
    }
  }

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
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: toAnthropicTools(),
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    content: { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }[];
  };

  let text = "";
  const toolCalls: ToolCall[] = [];
  for (const block of data.content) {
    if (block.type === "text" && block.text) text += block.text;
    if (block.type === "tool_use" && block.id && block.name) {
      toolCalls.push({ id: block.id, name: block.name, input: block.input ?? {} });
    }
  }
  return { text, toolCalls };
}

async function callOpenAi(
  history: NeutralMessage[],
  { apiKey, baseUrl, model }: LlmSettings
): Promise<LlmReply> {
  const messages: unknown[] = [{ role: "system", content: SYSTEM_PROMPT }];

  for (const m of history) {
    if (m.role === "user") {
      messages.push({ role: "user", content: m.content });
    } else if (m.role === "assistant") {
      messages.push({
        role: "assistant",
        content: m.text || null,
        tool_calls: m.toolCalls.map((tc) => ({
          id: tc.id,
          type: "function",
          function: { name: tc.name, arguments: JSON.stringify(tc.input) },
        })),
      });
    } else if (m.role === "tool_result") {
      messages.push({
        role: "tool",
        tool_call_id: m.toolCallId,
        content: JSON.stringify(m.output),
      });
    }
  }

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
    body: JSON.stringify({ model, messages, tools: toOpenAiTools() }),
  });

  if (!res.ok) {
    throw new Error(`Provider error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const raw = await res.text();
  const cleaned = raw.replace(/\n?data:\s*\[DONE\]\s*$/i, "").trim();
  const data = JSON.parse(cleaned) as {
    choices: {
      message: {
        content: string | null;
        tool_calls?: {
          id: string;
          function?: { name?: string; arguments?: string };
        }[];
      };
    }[];
  };

  const message = data.choices[0]?.message;
  const toolCalls: ToolCall[] = [];
  for (const tc of message?.tool_calls ?? []) {
    const name = tc.function?.name;
    if (!name) continue; // some free/small models omit this — skip rather than crash
    let input: Record<string, unknown> = {};
    try {
      input = JSON.parse(tc.function?.arguments || "{}");
    } catch {
      /* malformed JSON args from a weaker model — proceed with empty input */
    }
    toolCalls.push({ id: tc.id, name, input });
  }

  return { text: message?.content ?? "", toolCalls };
}
