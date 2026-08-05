export interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type SessionStatus = "idle" | "running" | "paused" | "error";

export interface Session {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: SessionStatus;
  sandbox_id: string | null;
  created_at: string;
  updated_at: string;
}

export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbAdapter {
  getOrCreateUser(walletAddress: string): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  listSessions(userId: string): Promise<Session[]>;
  getSession(sessionId: string): Promise<Session | null>;
  createSession(
    userId: string,
    title: string,
    description?: string
  ): Promise<Session>;
  deleteSession(userId: string, sessionId: string): Promise<boolean>;
  listMessages(sessionId: string): Promise<Message[]>;
  createMessage(
    sessionId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, unknown> | null
  ): Promise<Message>;
}