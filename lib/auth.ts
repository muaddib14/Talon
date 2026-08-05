import { getTokenFromRequest, verifyToken, type AuthPayload } from "./jwt";

export function authUser(req: Request): AuthPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}