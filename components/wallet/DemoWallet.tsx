"use client";

import {
  BaseMessageSignerWalletAdapter,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
  type WalletName,
} from "@solana/wallet-adapter-base";
import {
  PublicKey,
  type Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";
import nacl from "tweetnacl";

const DEMO_KEY = "talon_demo_secret_key";

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function loadOrCreateKeypair(): Uint8Array {
  if (typeof window === "undefined") {
    throw new Error("Demo wallet requires a browser");
  }

  const stored = window.localStorage.getItem(DEMO_KEY);
  if (stored) {
    try {
      const secretKey = base64ToBytes(stored);
      if (secretKey.length === nacl.sign.secretKeyLength) {
        return secretKey;
      }
    } catch {
      // fall through and regenerate
    }
  }

  const pair = nacl.sign.keyPair();
  window.localStorage.setItem(DEMO_KEY, bytesToBase64(pair.secretKey));
  return Uint8Array.from(pair.secretKey);
}

export class DemoWalletAdapter extends BaseMessageSignerWalletAdapter<"Demo Wallet (Dev)"> {
  name = "Demo Wallet (Dev)" as WalletName<"Demo Wallet (Dev)">;
  url = "https://github.com";
  icon =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'><rect width='36' height='36' rx='8' fill='%2306b6d4'/><text x='18' y='24' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'>T</text></svg>";
  supportedTransactionVersions = null;

  private _publicKey: PublicKey | null = null;
  private _connecting = false;
  private _secretKey: Uint8Array | null = null;

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return WalletReadyState.Installed;
  }

  async connect(): Promise<void> {
    try {
      if (this.connecting || this.publicKey) return;
      this._connecting = true;
      this._secretKey = loadOrCreateKeypair();
      const keypair = nacl.sign.keyPair.fromSecretKey(this._secretKey);
      this._publicKey = new PublicKey(keypair.publicKey);
      this.emit("connect", this._publicKey);
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.publicKey) return;
    this._publicKey = null;
    this._secretKey = null;
    this.emit("disconnect");
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._secretKey || !this.publicKey) {
      throw new WalletSignMessageError("Wallet not connected");
    }
    return nacl.sign.detached(message, this._secretKey);
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    void transaction;
    throw new WalletSignTransactionError(
      "Demo wallet cannot sign transactions"
    );
  }

  async signAllTransactions<
    T extends Transaction | VersionedTransaction,
  >(transactions: T[]): Promise<T[]> {
    void transactions;
    throw new WalletSignTransactionError(
      "Demo wallet cannot sign transactions"
    );
  }
}