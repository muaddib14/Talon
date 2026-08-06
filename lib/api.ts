import type { Message, MessageRole, Session as SessionItem } from "./db/types";
import { getLlmSettings } from "./llm-settings";

export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("talon_token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(Object.fromEntries(new Headers(options.headers).entries()) as Record<
      string,
      string
    >),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("talon_token");
    document.cookie = "talon_token=; path=/; max-age=0";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export async function listSessions() {
  const data = await apiRequest<{ sessions: SessionItem[] }>("/api/sessions");
  return data.sessions;
}

export async function createSession(title: string, description?: string) {
  const data = await apiRequest<{ session: SessionItem }>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
  return data.session;
}

export async function getSession(id: string) {
  const data = await apiRequest<{ session: SessionItem }>(
    `/api/sessions/${id}`
  );
  return data.session;
}

export async function deleteSession(id: string) {
  return apiRequest<{ ok: boolean }>(`/api/sessions/${id}`, {
    method: "DELETE",
  });
}

export async function renameSession(id: string, title: string) {
  const data = await apiRequest<{ session: SessionItem }>(
    `/api/sessions/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }
  );
  return data.session;
}

export async function listMessages(sessionId: string) {
  const data = await apiRequest<{ messages: Message[] }>(
    `/api/sessions/${sessionId}/messages`
  );
  return data.messages;
}

export async function createMessage(
  sessionId: string,
  role: MessageRole,
  content: string,
  metadata?: Record<string, unknown> | null
) {
  const data = await apiRequest<{ message: Message }>(
    `/api/sessions/${sessionId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ role, content, metadata }),
    }
  );
  return data.message;
}

export async function generateReply(sessionId: string, prompt: string) {
  const { apiKey, baseUrl, model, format } = getLlmSettings();
  if (!apiKey) {
    throw new Error("Missing API key. Add one in Settings first.");
  }

  const data = await apiRequest<{ message: Message }>(
    `/api/sessions/${sessionId}/generate`,
    {
      method: "POST",
      headers: {
        "x-llm-api-key": apiKey,
        "x-llm-base-url": baseUrl,
        "x-llm-model": model,
        "x-llm-format": format,
      },
      body: JSON.stringify({ prompt }),
    }
  );
  return data.message;
}

export async function executeInSandbox(sessionId: string, prompt: string) {
  const { apiKey, baseUrl, model, format } = getLlmSettings();
  if (!apiKey) {
    throw new Error("Missing API key. Add one in Settings first.");
  }

  const data = await apiRequest<{ message: Message }>(
    `/api/sessions/${sessionId}/execute`,
    {
      method: "POST",
      headers: {
        "x-llm-api-key": apiKey,
        "x-llm-base-url": baseUrl,
        "x-llm-model": model,
        "x-llm-format": format,
      },
      body: JSON.stringify({ prompt }),
    }
  );
  return data.message;
}