"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles, Trash2 } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import Logo from "@/components/Logo";
import { createSession, listSessions, deleteSession } from "@/lib/api";
import type { Session } from "@/lib/db/types";

interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<Session["status"], string> = {
  idle: "Ready",
  running: "Running",
  paused: "Paused",
  error: "Error",
};

const EXAMPLES = [
  "Build a landing page with a pricing section",
  "Create an admin dashboard with charts",
  "A to-do app with local storage",
  "Design a wallet connect flow",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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
      .then((data) => {
        if (data) setSessions(data);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleCreate = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      const title =
        trimmed.length > 64 ? `${trimmed.slice(0, 64)}…` : trimmed;
      const session = await createSession(title, trimmed);
      router.push(`/sessions/${session.id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCreate(prompt);
    }
  };

  const handleExample = (example: string) => {
    setPrompt(example);
    inputRef.current?.focus();
  };

  const handleDelete = async (sessionId: string) => {
    if (confirmId !== sessionId) {
      setConfirmId(sessionId);
      return;
    }
    setDeletingId(sessionId);
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <div className="dash">
      <header className="dash-header">
        <div className="logo">
          <Logo height={26} />
          <span className="logo-text">Frank Agent</span>
        </div>
        <div className="dash-header-actions">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="dash-avatar dash-avatar--sm"
            title="Profile"
            aria-label="Profile"
          >
            {user ? user.wallet_address.slice(0, 2).toUpperCase() : "•"}
          </button>
          <LogoutButton />
        </div>
      </header>

      <main className="dash-main">
        {loading ? (
          <DashboardSkeleton />
        ) : user ? (
          <>
            <div className="session-hero">
              <span className="session-hero-chip">
                <Sparkles size={12} />
                Frank agent
              </span>
              <h1 className="session-hero-title">
                What are we building today?
              </h1>
              <p className="session-hero-sub">
                Describe the app. Frank will plan it, write the code, and run
                it in a live sandbox.
              </p>

              <div className="session-hero-form">
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(
                      e.target.scrollHeight,
                      128
                    )}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. A portfolio site with a dark theme and project showcase…"
                  className="session-hero-input"
                  rows={1}
                />
                <button
                  type="button"
                  onClick={() => handleCreate(prompt)}
                  disabled={busy || !prompt.trim()}
                  className="btn-aurora session-hero-btn"
                >
                  {busy ? "Starting…" : "Start build"}
                </button>
              </div>

              <div className="session-hero-examples">
                <span className="session-hero-example-label">Try:</span>
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExample(example)}
                    className="session-chip"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {sessions.length > 0 && (
              <>
                <div className="dash-section-head">
                  <span className="dash-label">Recent sessions</span>
                </div>
                <div className="session-grid">
                  {sessions.map((s) => (
                    <div key={s.id} className="session-card">
                      <div className="session-card-top">
                        <button
                          type="button"
                          onClick={() => router.push(`/sessions/${s.id}`)}
                          className="session-title-btn"
                        >
                          <span className="session-title">{s.title}</span>
                        </button>
                        <span
                          className={`session-status session-status--${s.status}`}
                        >
                          <span
                            className="session-status-dot"
                            aria-hidden="true"
                          />
                          {STATUS_LABEL[s.status]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          onBlur={() =>
                            setConfirmId((prev) =>
                              prev === s.id ? null : prev
                            )
                          }
                          disabled={deletingId === s.id}
                          className={`session-card-delete${
                            confirmId === s.id
                              ? " session-card-delete--confirm"
                              : ""
                          }`}
                          title={
                            confirmId === s.id
                              ? "Click again to confirm"
                              : "Delete session"
                          }
                          aria-label="Delete session"
                        >
                          <Trash2 size={14} />
                          {confirmId === s.id ? <span>Confirm?</span> : null}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/sessions/${s.id}`)}
                        className="session-card-hit"
                      >
                        {s.description ? (
                          <p className="session-card-desc">{s.description}</p>
                        ) : null}
                        <div className="session-card-foot">
                          <span className="session-card-date">
                            {formatDate(s.updated_at)}
                          </span>
                          <span className="session-card-open">
                            Open session
                            <ArrowUpRight size={14} />
                          </span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
