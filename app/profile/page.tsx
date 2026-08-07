"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import ProfileSkeleton from "@/components/ProfileSkeleton";
import Logo from "@/components/Logo";
import { listSessions } from "@/lib/api";
import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  getLlmSettings,
  saveLlmSettings,
  type LlmFormat,
} from "@/lib/llm-settings";

interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
}

const PROVIDER_PRESETS: {
  label: string;
  url: string;
  format: LlmFormat;
  model: string;
}[] = [
  {
    label: "Anthropic",
    url: "https://api.anthropic.com",
    format: "anthropic",
    model: DEFAULT_MODEL,
  },
  {
    label: "OpenRouter",
    url: "https://openrouter.ai/api/v1",
    format: "openai",
    model: "anthropic/claude-3.5-sonnet",
  },
  { label: "Custom", url: "", format: "openai", model: "" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backTo = searchParams.get("from") || "/dashboard";
  const [user, setUser] = useState<User | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(() => getLlmSettings());
  const [baseUrl, setBaseUrl] = useState(saved.baseUrl);
  const [apiKey, setApiKey] = useState(saved.apiKey);
  const [model, setModel] = useState(saved.model);
  const [format, setFormat] = useState<LlmFormat>(saved.format);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const isDirty =
    baseUrl.trim() !== saved.baseUrl ||
    apiKey !== saved.apiKey ||
    model.trim() !== saved.model ||
    format !== saved.format;

  const activePreset =
    PROVIDER_PRESETS.find((p) => p.url === baseUrl.trim())?.label ?? "Custom";

  const handlePreset = (preset: (typeof PROVIDER_PRESETS)[number]) => {
    setBaseUrl(preset.url);
    setFormat(preset.format);
    setModel(preset.model);
  };

  useEffect(() => {
    const token = localStorage.getItem("frank_token");
    if (!token) {
      router.replace("/");
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (meRes) => {
        if (meRes.status === 401) {
          localStorage.removeItem("frank_token");
          router.replace("/");
          return;
        }
        if (!meRes.ok) throw new Error("Failed to load user");
        const me = await meRes.json();
        setUser(me.user);
        return listSessions();
      })
      .then((sessions) => {
        setSessionCount(sessions?.length ?? 0);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSaveKey = () => {
    const next = {
      baseUrl: baseUrl.trim() || DEFAULT_BASE_URL,
      apiKey,
      model: model.trim() || DEFAULT_MODEL,
      format,
    };
    saveLlmSettings(next);
    setSaved(next);
    setBaseUrl(next.baseUrl);
    setModel(next.model);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const handleCopy = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.wallet_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="logo">
          <Logo height={26} />
        </div>
        <LogoutButton />
      </header>

      <main className="dash-main">
        {loading ? (
          <ProfileSkeleton />
        ) : user ? (
          <>
            <button
              type="button"
              onClick={() => router.push(backTo)}
              className="session-back"
            >
              <ArrowLeft size={14} />
              {backTo === "/dashboard" ? "Back to dashboard" : "Back to session"}
            </button>

            <div className="profile-layout">
              <div className="profile-panel">
                <div className="dash-avatar profile-avatar">
                  {user.wallet_address.slice(0, 2).toUpperCase()}
                </div>
                <h1 className="profile-name">
                  {user.username ?? "Frank user"}
                </h1>
                <p className="profile-note">
                  Wallet-linked account · no password needed
                </p>

                <div className="profile-wallet-row">
                  <code className="profile-wallet">
                    {user.wallet_address}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`profile-copy${
                      copied ? " profile-copy--copied" : ""
                    }`}
                    title={copied ? "Copied!" : "Copy wallet address"}
                    aria-label="Copy wallet address"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>

                <div className="profile-stats">
                  <div className="profile-stat">
                    <span className="profile-stat-num">{sessionCount}</span>
                    <span className="profile-stat-label">
                      {sessionCount === 1 ? "session" : "sessions"}
                    </span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-num">Phantom</span>
                    <span className="profile-stat-label">
                      connect method
                    </span>
                  </div>
                  <div className="profile-stat">
                    <span className="profile-stat-num">
                      {formatDate(user.created_at)}
                    </span>
                    <span className="profile-stat-label">member since</span>
                  </div>
                </div>
              </div>

              <div className="settings-panel">
                <div className="settings-head">
                  <KeyRound size={16} />
                  <div>
                    <h2 className="settings-title">Model settings (BYOK)</h2>
                    <p className="settings-sub">
                      Your key stays in this browser only — sent directly to
                      the model provider, never stored on our servers.
                    </p>
                  </div>
                  <span
                    className={`settings-status${
                      saved.apiKey ? " settings-status--on" : ""
                    }`}
                  >
                    <span className="settings-status-dot" aria-hidden="true" />
                    {saved.apiKey ? "Key configured" : "No key set"}
                  </span>
                </div>

                <div className="settings-presets">
                  {PROVIDER_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePreset(p)}
                      className={`settings-preset${
                        activePreset === p.label
                          ? " settings-preset--active"
                          : ""
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <label className="settings-field" style={{ marginBottom: 16 }}>
                  <span>API base URL</span>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder={DEFAULT_BASE_URL}
                    className="settings-input"
                    spellCheck={false}
                  />
                </label>

                <div className="settings-grid">
                  <label className="settings-field">
                    <span>Model</span>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={
                        format === "openai" ? "e.g. gpt-4o, daily-coding" : DEFAULT_MODEL
                      }
                      className="settings-input"
                      spellCheck={false}
                    />
                  </label>

                  <label className="settings-field">
                    <span>API key</span>
                    <div className="settings-key-row">
                      <input
                        type={showKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="settings-input"
                        spellCheck={false}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="settings-key-toggle"
                        aria-label={showKey ? "Hide key" : "Show key"}
                        title={showKey ? "Hide key" : "Show key"}
                      >
                        {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="settings-format">
                  <span>Request format</span>
                  <div className="settings-format-toggle">
                    <button
                      type="button"
                      onClick={() => setFormat("anthropic")}
                      className={`settings-format-btn${
                        format === "anthropic" ? " settings-format-btn--active" : ""
                      }`}
                    >
                      Anthropic
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat("openai")}
                      className={`settings-format-btn${
                        format === "openai" ? " settings-format-btn--active" : ""
                      }`}
                    >
                      OpenAI-compatible
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveKey}
                  disabled={!isDirty}
                  className="btn-aurora settings-save"
                >
                  {savedFlash ? (
                    <>
                      <Check size={15} />
                      Saved
                    </>
                  ) : isDirty ? (
                    "Save settings"
                  ) : (
                    "No changes"
                  )}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}