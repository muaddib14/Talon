import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import type { DbAdapter, Message, MessageRole, Session, User } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "talon-db.json");

interface LocalDB {
  users: User[];
  sessions: Session[];
  messages: Message[];
  tool_calls: never[];
  checkpoints: never[];
}

function emptyDB(): LocalDB {
  return { users: [], sessions: [], messages: [], tool_calls: [], checkpoints: [] };
}

function readDB(): LocalDB {
  try {
    if (!fs.existsSync(DB_FILE)) return emptyDB();
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as LocalDB;
    return { ...emptyDB(), ...parsed };
  } catch {
    return emptyDB();
  }
}

function writeDB(db: LocalDB): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export const getOrCreateUser: DbAdapter["getOrCreateUser"] = async (
  walletAddress: string
) => {
  const db = readDB();
  const existing = db.users.find((u) => u.wallet_address === walletAddress);
  if (existing) return existing;

  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    wallet_address: walletAddress,
    username: walletAddress.slice(0, 8),
    avatar_url: null,
    bio: null,
    created_at: now,
    updated_at: now,
  };

  db.users.push(user);
  writeDB(db);
  return user;
};

export const getUserById: DbAdapter["getUserById"] = async (id: string) => {
  return readDB().users.find((u) => u.id === id) ?? null;
};

export const listSessions: DbAdapter["listSessions"] = async (userId: string) => {
  return readDB()
    .sessions.filter((s) => s.user_id === userId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
};

export const getSession: DbAdapter["getSession"] = async (sessionId: string) => {
  return readDB().sessions.find((s) => s.id === sessionId) ?? null;
};

export const createSession: DbAdapter["createSession"] = async (
  userId: string,
  title: string,
  description?: string
) => {
  const db = readDB();
  const now = new Date().toISOString();

  const session: Session = {
    id: randomUUID(),
    user_id: userId,
    title: title || "Untitled Session",
    description: description ?? null,
    status: "idle",
    sandbox_id: null,
    created_at: now,
    updated_at: now,
  };

  db.sessions.push(session);
  writeDB(db);
  return session;
};

export const listMessages: DbAdapter["listMessages"] = async (sessionId: string) => {
  return readDB()
    .messages.filter((m) => m.session_id === sessionId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
};

export const createMessage: DbAdapter["createMessage"] = async (
  sessionId: string,
  role: MessageRole,
  content: string,
  metadata: Record<string, unknown> | null = null
) => {
  const db = readDB();
  const message: Message = {
    id: randomUUID(),
    session_id: sessionId,
    role,
    content,
    metadata,
    created_at: new Date().toISOString(),
  };

  db.messages.push(message);
  writeDB(db);
  return message;
};

export const deleteSession: DbAdapter["deleteSession"] = async (
  userId: string,
  sessionId: string
) => {
  const db = readDB();
  const owns = db.sessions.some(
    (s) => s.id === sessionId && s.user_id === userId
  );
  if (!owns) return false;

  db.sessions = db.sessions.filter((s) => s.id !== sessionId);
  db.messages = db.messages.filter((m) => m.session_id !== sessionId);
  writeDB(db);
  return true;
};