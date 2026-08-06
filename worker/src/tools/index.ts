import type { Sandbox } from "e2b";
import { runCommand, writeFile } from "../sandbox.js";

export interface ToolDef {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export const TOOL_DEFS: ToolDef[] = [
  {
    name: "write_file",
    description: "Create or overwrite a file in the sandbox.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path, e.g. index.html" },
        content: { type: "string", description: "Full file contents" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_command",
    description: "Execute a shell command in the sandbox and return its output.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to run" },
      },
      required: ["command"],
    },
  },
];

// Anthropic wants "input_schema" instead of "parameters" — same shape otherwise.
export function toAnthropicTools() {
  return TOOL_DEFS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

// OpenAI-compatible wants each tool wrapped as { type: "function", function: {...} }.
export function toOpenAiTools() {
  return TOOL_DEFS.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

export async function executeTool(
  sandbox: Sandbox,
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "write_file":
      return writeFile(sandbox, String(input.path), String(input.content));
    case "run_command":
      return runCommand(sandbox, String(input.command));
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
