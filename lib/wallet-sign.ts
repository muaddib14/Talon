import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

const MESSAGE_MAX_AGE_MS = 5 * 60 * 1000;

export function buildLoginMessage(walletAddress: string, now: number): Uint8Array {
  return new TextEncoder().encode(
    `Login to Frank\nWallet: ${walletAddress}\nTimestamp: ${now}`
  );
}

export interface SignatureCheck {
  ok: boolean;
  error?: string;
}

export function verifyLoginSignature(
  publicKey: string,
  signatureB64: string,
  messageB64: string
): SignatureCheck {
  if (!publicKey || !signatureB64 || !messageB64) {
    return { ok: false, error: "Missing required fields" };
  }

  let message: Uint8Array;
  let signature: Uint8Array;
  let publicKeyObj: PublicKey;

  try {
    message = Uint8Array.from(Buffer.from(messageB64, "base64"));
    signature = Uint8Array.from(Buffer.from(signatureB64, "base64"));
    publicKeyObj = new PublicKey(publicKey);
  } catch {
    return { ok: false, error: "Invalid payload" };
  }

  const isValid = nacl.sign.detached.verify(
    message,
    signature,
    publicKeyObj.toBytes()
  );

  if (!isValid) {
    return { ok: false, error: "Invalid signature" };
  }

  const messageStr = new TextDecoder().decode(message);
  const timestampMatch = messageStr.match(/Timestamp: (\d+)/);
  if (!timestampMatch) {
    return { ok: false, error: "Malformed message" };
  }

  const msgTimestamp = parseInt(timestampMatch[1], 10);
  if (Number.isNaN(msgTimestamp) || Date.now() - msgTimestamp > MESSAGE_MAX_AGE_MS) {
    return { ok: false, error: "Message expired" };
  }

  return { ok: true };
}