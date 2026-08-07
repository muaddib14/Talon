"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildLoginMessage } from "@/lib/wallet-sign";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export function useTalonAuth() {
  const router = useRouter();
  const { publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingRef = useRef(false);
  const attemptedKeyRef = useRef<string | null>(null);

  const openWalletModal = useCallback(() => {
    pendingRef.current = true;
    setError(null);
    setVisible(true);
  }, [setVisible]);

  const login = useCallback(async (): Promise<LoginResult> => {
    if (!publicKey || !signMessage) {
      const msg = "Wallet not connected";
      setError(msg);
      return { ok: false, error: msg };
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toString();
      const message = buildLoginMessage(walletAddress, Date.now());
      const signature = await signMessage(message);

      const res = await fetch("/api/auth/phantom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: walletAddress,
          signature: bytesToBase64(signature),
          message: bytesToBase64(message),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Login failed");

      localStorage.setItem("talon_token", data.token);
      document.cookie = `talon_token=${data.token}; path=/; max-age=604800; samesite=lax`;

      pendingRef.current = false;
      attemptedKeyRef.current = null;
      router.push("/dashboard");
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, signMessage, router]);

  useEffect(() => {
    if (!publicKey || !signMessage) return;
    if (!pendingRef.current) return;

    const key = publicKey.toString();
    if (attemptedKeyRef.current === key) return;
    attemptedKeyRef.current = key;

    login();
  }, [publicKey, signMessage, login]);

  return {
    openWalletModal,
    login,
    isLoading,
    error,
    isConnected: !!publicKey,
  };
}