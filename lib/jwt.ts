import jwt from "jsonwebtoken";

export interface AuthPayload {
  userId: string;
  walletAddress: string;
}

const JWT_SECRET =
  process.env.JWT_SECRET ?? "frank-dev-secret-change-me-in-production";
const TOKEN_TTL = "7d";

export function signToken(payload: AuthPayload): string {
  return jwt.sign({ ...payload }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;
    if (!decoded.userId || !decoded.walletAddress) return null;
    return {
      userId: String(decoded.userId),
      walletAddress: String(decoded.walletAddress),
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}