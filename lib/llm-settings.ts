const BASE_URL_KEY = "frank_llm_base_url";
const API_KEY_KEY = "frank_llm_api_key";
const MODEL_KEY = "frank_llm_model";
const FORMAT_KEY = "frank_llm_format";

export const DEFAULT_BASE_URL = "https://api.anthropic.com";
export const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

export type LlmFormat = "anthropic" | "openai";

export interface LlmSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
  format: LlmFormat;
}

function readFormat(value: string | null): LlmFormat {
  return value === "openai" ? "openai" : "anthropic";
}

export function getLlmSettings(): LlmSettings {
  if (typeof localStorage === "undefined") {
    return {
      baseUrl: DEFAULT_BASE_URL,
      apiKey: "",
      model: DEFAULT_MODEL,
      format: "anthropic",
    };
  }
  return {
    baseUrl: localStorage.getItem(BASE_URL_KEY)?.trim() || DEFAULT_BASE_URL,
    apiKey: localStorage.getItem(API_KEY_KEY)?.trim() || "",
    model: localStorage.getItem(MODEL_KEY)?.trim() || DEFAULT_MODEL,
    format: readFormat(localStorage.getItem(FORMAT_KEY)),
  };
}

export function saveLlmSettings(settings: LlmSettings): void {
  localStorage.setItem(BASE_URL_KEY, settings.baseUrl.trim());
  localStorage.setItem(API_KEY_KEY, settings.apiKey.trim());
  localStorage.setItem(MODEL_KEY, settings.model.trim());
  localStorage.setItem(FORMAT_KEY, settings.format);
}

export function clearLlmSettings(): void {
  localStorage.removeItem(BASE_URL_KEY);
  localStorage.removeItem(API_KEY_KEY);
  localStorage.removeItem(MODEL_KEY);
  localStorage.removeItem(FORMAT_KEY);
}

export function hasLlmKey(): boolean {
  return getLlmSettings().apiKey.length > 0;
}
