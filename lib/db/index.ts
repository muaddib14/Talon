import * as local from "./local";
import * as supabase from "./supabase";
import type { DbAdapter, User } from "./types";

export type { User };

export function getDb(): DbAdapter {
  const backend = process.env.TALON_DB_BACKEND ?? "local";
  return backend === "supabase" ? supabase : local;
}