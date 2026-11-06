import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };
export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  return <SettingsView user={user} />;
}
