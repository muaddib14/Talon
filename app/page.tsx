import type { Metadata } from "next";
import Landing from "@/components/Landing";

export const metadata: Metadata = {
  title: "Talon — AI Coding Agent, Powered by Your Wallet",
  description:
    "Describe what to build, and Talon writes, runs, and ships real code in an isolated sandbox. Download your project. BYOK — bring your own Claude key. Free forever.",
};

export default function Page() {
  return <Landing />;
}