"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const { disconnect } = useWallet();

  const handleLogout = async () => {
    localStorage.removeItem("frank_token");
    document.cookie = "frank_token=; path=/; max-age=0";
    await disconnect();
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn-ghost btn-ghost--sm dash-logout"
    >
      Logout
    </button>
  );
}