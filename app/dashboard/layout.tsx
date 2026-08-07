import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Frank",
  description: "Your Frank sessions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}