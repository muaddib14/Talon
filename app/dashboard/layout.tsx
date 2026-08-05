import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Talon",
  description: "Your Talon sessions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}