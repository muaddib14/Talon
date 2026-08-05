import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { verifyLoginSignature } from "@/lib/wallet-sign";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { publicKey, signature, message } = body ?? {};

    const check = verifyLoginSignature(publicKey, signature, message);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 401 });
    }

    const user = await getDb().getOrCreateUser(publicKey);
    const token = signToken({
      userId: user.id,
      walletAddress: user.wallet_address,
    });

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}