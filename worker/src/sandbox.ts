import { Sandbox } from "e2b";

export async function createSandbox(): Promise<Sandbox> {
  return Sandbox.create({ apiKey: process.env.E2B_API_KEY });
}

export async function writeFile(
  sandbox: Sandbox,
  path: string,
  content: string
): Promise<{ status: "success"; path: string }> {
  await sandbox.files.write(path, content);
  return { status: "success", path };
}

export async function runCommand(
  sandbox: Sandbox,
  command: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const result = await sandbox.commands.run(command, { timeoutMs: 30_000 });
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
  };
}
