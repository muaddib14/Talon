"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import {
  Check,
  Download,
  File,
  Inbox,
  ListChecks,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Search,
  Send,
  Settings,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import {
  createMessage,
  deleteSession,
  executeInSandbox,
  getSession,
  listMessages,
  listSessions,
  renameSession,
} from "@/lib/api";
import LoadingDots from "@/components/LoadingDots";
import Logo from "@/components/Logo";
import type { Message, Session } from "@/lib/db/types";
import { buildMockReply, type MockFile } from "@/lib/mock-agent";
import { hasLlmKey } from "@/lib/llm-settings";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface WalletUser {
  wallet_address: string;
  username: string | null;
}

function parseFiles(metadata: Record<string, unknown> | null): MockFile[] {
  const files = metadata?.files;
  if (!Array.isArray(files)) return [];
  return files.filter(
    (f): f is MockFile =>
      typeof f === "object" &&
      f !== null &&
      typeof (f as MockFile).path === "string" &&
      typeof (f as MockFile).content === "string"
  );
}

export default function SessionPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [session, setSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [user, setUser] = useState<WalletUser | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = searchQuery.trim()
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : sessions;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    setCollapsed(localStorage.getItem("frank_sidebar_collapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("frank_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  const handleRenameStart = (s: Session) => {
    setMenuOpenId(null);
    setRenamingId(s.id);
    setRenameValue(s.title);
  };

  const handleRenameSubmit = async (sessionId: string) => {
    const title = renameValue.trim();
    setRenamingId(null);
    if (!title) return;
    try {
      const updated = await renameSession(sessionId, title);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updated : s))
      );
      if (session?.id === sessionId) {
        setSession(updated);
      }
    } catch {
      /* keep old title on failure */
    }
  };

  const handleSidebarDelete = async (sessionId: string) => {
    setMenuOpenId(null);
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (sessionId === id) {
        router.replace("/dashboard");
      }
    } catch {
      /* no-op */
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("frank_token");
    if (!token || !id) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    Promise.all([
      getSession(id).catch(() => null),
      listMessages(id).catch(() => []),
      listSessions().catch(() => []),
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data?.user ?? null)
        .catch(() => null),
    ])
      .then(([s, msgs, allSessions, me]) => {
        if (cancelled) return;
        if (!s) {
          router.replace("/dashboard");
          return;
        }
        setSession(s);
        setMessages(msgs);
        setSessions(allSessions.filter((other) => other.id !== s.id));
        setUser(me);
      })
      .catch(() => router.replace("/"))
      .finally(() => setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [router, id]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, typing]);

  useEffect(() => {
    if (!menuOpenId) return;
    const close = () => setMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpenId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !session || sending) return;

    setSending(true);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const userMsg = await createMessage(session.id, "user", text);
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);

      const agentMsg = !hasLlmKey()
        ? await (async () => {
            await new Promise((r) => setTimeout(r, 900));
            const reply = buildMockReply(text, session.title);
            return createMessage(session.id, "assistant", reply.text, {
              plan: reply.plan,
              files: reply.files,
            });
          })()
        : await executeInSandbox(session.id, text);

      setTyping(false);
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setTyping(false);
      const errMsg = await createMessage(
        session.id,
        "assistant",
        err instanceof Error ? err.message : "Something went wrong."
      );
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async () => {
    if (!session) return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteSession(session.id);
      router.replace("/dashboard");
    } finally {
      setDeleting(false);
      setDeleteArmed(false);
    }
  };

  const handleDownload = async (message: Message) => {
    const files = parseFiles(message.metadata);
    if (files.length === 0) return;

    const zip = new JSZip();
    files.forEach((f) => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: "blob" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `frank-${session?.id.slice(0, 8) ?? "project"}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ws">
      {sidebarOpen && (
        <div
          className="ws-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`ws-sidebar${sidebarOpen ? " ws-sidebar--open" : ""}${
          collapsed ? " ws-sidebar--collapsed" : ""
        }`}
      >
        <div className="ws-sidebar-head">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="ws-logo-btn"
            title="Back to dashboard"
          >
            <Logo height={26} />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="ws-collapse-btn"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="ws-new-row"
        >
          <SquarePen size={17} />
          New session
        </button>

        {searchOpen ? (
          <div className="ws-search-row">
            <Search size={16} />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && closeSearch()}
              placeholder="Search sessions…"
              className="ws-search-input"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="ws-search-close"
              aria-label="Close search"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="ws-new-row"
          >
            <Search size={17} />
            Search sessions
          </button>
        )}

        <nav className="ws-nav">
          {loading ? (
            <div className="ws-nav-loading" aria-hidden="true">
              <LoadingDots label="Loading" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="ws-nav-empty">
              <Inbox size={20} strokeWidth={1.5} />
              <p>No other sessions yet</p>
              <span>New builds will show up here</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="ws-nav-empty">
              <Search size={20} strokeWidth={1.5} />
              <p>No matches</p>
              <span>Try a different search</span>
            </div>
          ) : (
            filteredSessions.map((s) => (
              <div key={s.id} className="ws-nav-row">
                {renamingId === s.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(s.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="ws-nav-rename-input"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push(`/sessions/${s.id}`)}
                    className={`ws-nav-item${
                      s.id === id ? " ws-nav-item--active" : ""
                    }`}
                    title={s.title}
                  >
                    <span className="ws-nav-title">{s.title}</span>
                    <span className="ws-nav-date">
                      {formatDate(s.updated_at)}
                    </span>
                  </button>
                )}

                <div className="ws-nav-menu">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((prev) => (prev === s.id ? null : s.id));
                    }}
                    className="ws-nav-menu-btn"
                    aria-label="Session options"
                  >
                    <MoreHorizontal size={15} />
                  </button>

                  {menuOpenId === s.id && (
                    <div
                      className="ws-nav-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleRenameStart(s)}
                      >
                        <Pencil size={13} />
                        Rename
                      </button>
                      <button
                        type="button"
                        className="ws-nav-dropdown-danger"
                        onClick={() => handleSidebarDelete(s.id)}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </nav>

        {user && (
          <button
            type="button"
            onClick={() =>
              router.push(`/profile?from=${encodeURIComponent(`/sessions/${id}`)}`)
            }
            className="ws-profile-row"
            title="Profile & settings"
          >
            <span className="ws-profile-avatar">
              {user.wallet_address.slice(0, 2).toUpperCase()}
            </span>
            <span className="ws-profile-info">
              <span className="ws-profile-name">
                {user.username ?? "Frank user"}
              </span>
              <span className="ws-profile-wallet">
                {user.wallet_address.slice(0, 4)}…
                {user.wallet_address.slice(-4)}
              </span>
            </span>
            <Settings size={16} className="ws-profile-gear" />
          </button>
        )}
      </aside>

      <div className="ws-main">
        <header className="ws-head">
          {collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="ws-expand-btn"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <PanelLeftOpen size={17} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="ws-menu-btn"
            aria-label="Toggle sessions"
          >
            <Menu size={18} />
          </button>
          <div className="ws-head-titles">
            <span className="ws-head-title">
              {loading ? (
                <span
                  className="ws-skeleton"
                  style={{ height: 16, width: 220, marginTop: 6 }}
                />
              ) : (
                session?.title ?? "Session"
              )}
            </span>
            <span className="ws-head-sub">
              {session ? (
                <span className="ws-head-id">#{session.id.slice(0, 8)}</span>
              ) : null}
            </span>
          </div>
          {session ? (
            <button
              type="button"
              onClick={handleDelete}
              onBlur={() => setDeleteArmed(false)}
              disabled={deleting}
              className={`ws-delete-btn${
                deleteArmed ? " ws-delete-btn--confirm" : ""
              }`}
              title={deleteArmed ? "Click again to confirm" : "Delete session"}
              aria-label="Delete session"
            >
              <Trash2 size={15} />
              {deleteArmed ? <span>Confirm delete</span> : null}
            </button>
          ) : null}
        </header>

        <div className="ws-chat" ref={scrollRef}>
          {loading ? (
            <div className="ws-chat-empty" aria-hidden="true">
              <LoadingDots label="Loading conversation" />
            </div>
          ) : messages.length === 0 ? (
            <div className="ws-chat-empty">
              <span className="ws-chat-empty-chip">
                <ListChecks size={12} />
                Live agent
              </span>
              <p className="ws-chat-empty-title">
                {session?.title ?? "Untitled"}
              </p>
              <p className="ws-chat-empty-text">
                Describe what you want to build below. Frank replies with a
                plan and a downloadable HTML/CSS/JS project — no sandbox, no
                preview, just the source ZIP.
              </p>
            </div>
          ) : (
            <div className="ws-thread">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="ws-msg ws-msg--user">
                    <div className="ws-bubble">
                      <span className="ws-bubble-text">{m.content}</span>
                      <span className="ws-bubble-time">
                        {formatTime(m.created_at)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="ws-msg ws-msg--agent">
                    <div className="ws-agent-avatar">T</div>
                    <div className="ws-agent-body">
                      <div className="ws-agent-meta">
                        <span className="ws-agent-name">Frank</span>
                        <span className="ws-agent-time">
                          {formatTime(m.created_at)}
                        </span>
                      </div>
                      <p className="ws-agent-text">{m.content}</p>

                      {Array.isArray(m.metadata?.plan) ? (
                        <div className="ws-plan">
                          <span className="ws-block-label">Plan</span>
                          <ul>
                            {(m.metadata.plan as string[]).map((step, i) => (
                              <li key={i}>
                                <Check size={13} />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {parseFiles(m.metadata).length > 0 && (
                        <div className="ws-artifact">
                          <span className="ws-block-label">Artifacts</span>
                          <div className="ws-artifact-files">
                            {parseFiles(m.metadata).map((f) => (
                              <div key={f.path} className="ws-file">
                                <File size={14} />
                                <span className="ws-file-path">{f.path}</span>
                                <span className="ws-file-size">
                                  {formatSize(f.content.length)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(m)}
                            className="btn-aurora ws-artifact-btn"
                          >
                            <Download size={15} />
                            Download ZIP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
              {typing && (
                <div className="ws-msg ws-msg--agent">
                  <div className="ws-agent-avatar">T</div>
                  <div className="ws-agent-body">
                    <div className="ws-agent-meta">
                      <span className="ws-agent-name">Frank</span>
                    </div>
                    <div className="ws-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ws-composer">
          <div className="ws-composer-inner">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Frank for a change or a new build…"
              className="ws-composer-input"
              rows={1}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || typing || !input.trim() || !session}
              className="ws-send-btn"
              aria-label="Send message"
            >
              {sending || typing ? (
                <span className="ws-send-dots">
                  <span />
                  <span />
                  <span />
                </span>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}