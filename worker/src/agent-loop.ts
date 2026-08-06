import { createClient } from "@supabase/supabase-js";
import type { Sandbox } from "e2b";
import { createSandbox } from "./sandbox.js";
import { executeTool } from "./tools/index.js";
import { callLlm, type LlmSettings, type NeutralMessage, type ToolCall } from "./llm.js";

const MAX_ITERATIONS = 5;

export interface AgentResult {
  text: string;
  files: { path: string; content: string }[];
  commands: { command: string; stdout: string; stderr: string; exitCode: number }[];
}

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
    : null;

async function logToolCall(
  sessionId: string,
  toolName: string,
  input: unknown,
  output: unknown
) {
  if (!supabase) return;
  await supabase.from("tool_calls").insert({
    session_id: sessionId,
    tool_name: toolName,
    input,
    output,
  });
}

export async function runAgentLoop(
  sessionId: string,
  prompt: string,
  settings: LlmSettings
): Promise<AgentResult> {
  const history: NeutralMessage[] = [{ role: "user", content: prompt }];

  const files: Record<string, string> = {};
  const commands: AgentResult["commands"] = [];

  // Sandbox is created lazily — only spun up the moment the model actually
  // calls a tool. Plain conversational replies never touch e2b at all.
  let sandbox: Sandbox | null = null;

  try {
    let iterations = 0;
    let finalText = "";

    while (iterations < MAX_ITERATIONS) {
      const reply = await callLlm(history, settings);

      if (reply.toolCalls.length === 0) {
        finalText = reply.text;
        history.push({ role: "assistant", text: reply.text, toolCalls: [] });
        break;
      }

      history.push({ role: "assistant", text: reply.text, toolCalls: reply.toolCalls });

      if (!sandbox) {
        sandbox = await createSandbox();
      }

      for (const call of reply.toolCalls as ToolCall[]) {
        const output = await executeTool(sandbox, call.name, call.input);
        await logToolCall(sessionId, call.name, call.input, output);

        if (call.name === "write_file") {
          files[String(call.input.path)] = String(call.input.content);
        }
        if (call.name === "run_command") {
          const out = output as { stdout: string; stderr: string; exitCode: number };
          commands.push({ command: String(call.input.command), ...out });
        }

        history.push({
          role: "tool_result",
          toolCallId: call.id,
          name: call.name,
          output,
        });
      }

      iterations++;
      if (iterations === MAX_ITERATIONS) {
        finalText =
          reply.text || "Reached the step limit for this run — ask me to continue if needed.";
      }
    }

    return {
      text: finalText,
      files: Object.entries(files).map(([path, content]) => ({ path, content })),
      commands,
    };
  } finally {
    if (sandbox) await sandbox.kill();
  }
}
