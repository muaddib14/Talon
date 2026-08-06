import "dotenv/config";
import express from "express";
import { runAgentLoop } from "./agent-loop.js";
import type { LlmFormat } from "./llm.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const SHARED_SECRET = process.env.WORKER_SHARED_SECRET;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/process", async (req, res) => {
  if (SHARED_SECRET && req.headers["x-worker-secret"] !== SHARED_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { sessionId, prompt, apiKey, baseUrl, model, format } = req.body as {
    sessionId?: string;
    prompt?: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    format?: LlmFormat;
  };

  if (!sessionId || !prompt || !apiKey || !baseUrl || !model) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await runAgentLoop(sessionId, prompt, {
      apiKey,
      baseUrl,
      model,
      format: format === "openai" ? "openai" : "anthropic",
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Agent run failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Talon worker listening on port ${PORT}`);
});
