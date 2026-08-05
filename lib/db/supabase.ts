import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  DbAdapter,
  Message,
  MessageRole,
  Session,
  SessionStatus,
  User,
} from "./types";

type UserRow = Record<string, unknown> & {
  id: string;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type SessionRow = Record<string, unknown> & {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: SessionStatus;
  sandbox_id: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = Record<string, unknown> & {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase credentials not configured");
  }

  client = createClient(url, serviceKey);
  return client;
}

function toUser(row: UserRow | null): User | null {
  if (!row) return null;
  return {
    id: row.id,
    wallet_address: row.wallet_address,
    username: row.username ?? null,
    avatar_url: row.avatar_url ?? null,
    bio: row.bio ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const getOrCreateUser: DbAdapter["getOrCreateUser"] = async (
  walletAddress: string
) => {
  const supabase = getClient();

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (existing) return toUser(existing)!;

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      wallet_address: walletAddress,
      username: walletAddress.slice(0, 8),
    })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to create user");
  }

  return toUser(created)!;
};

export const getUserById: DbAdapter["getUserById"] = async (id: string) => {
  const supabase = getClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return toUser(data as UserRow | null);
};

function toSession(row: SessionRow | null): Session | null {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description ?? null,
    status: row.status,
    sandbox_id: row.sandbox_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const listSessions: DbAdapter["listSessions"] = async (userId: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => toSession(r as SessionRow)!).filter(Boolean);
};

export const getSession: DbAdapter["getSession"] = async (sessionId: string) => {
  const supabase = getClient();
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  return toSession(data as SessionRow | null);
};

export const createSession: DbAdapter["createSession"] = async (
  userId: string,
  title: string,
  description?: string
) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      title: title || "Untitled Session",
      description: description ?? null,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create session");
  return toSession(data as SessionRow)!;
};

function toMessage(row: MessageRow | null): Message | null {
  if (!row) return null;
  return {
    id: row.id,
    session_id: row.session_id,
    role: row.role,
    content: row.content,
    metadata: row.metadata ?? null,
    created_at: row.created_at,
  };
}

export const listMessages: DbAdapter["listMessages"] = async (sessionId: string) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((r) => toMessage(r as MessageRow)!)
    .filter((m): m is Message => Boolean(m));
};

export const createMessage: DbAdapter["createMessage"] = async (
  sessionId: string,
  role: MessageRole,
  content: string,
  metadata: Record<string, unknown> | null = null
) => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ session_id: sessionId, role, content, metadata })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create message");
  return toMessage(data as MessageRow)!;
};

export const deleteSession: DbAdapter["deleteSession"] = async (
  userId: string,
  sessionId: string
) => {
  const supabase = getClient();
  const { error, count } = await supabase
    .from("sessions")
    .delete({ count: "exact" })
    .eq("id", sessionId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
};