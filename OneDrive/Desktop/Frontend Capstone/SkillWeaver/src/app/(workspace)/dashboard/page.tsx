import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { getSessionUser } from "@/lib/auth";
import { getWorkspace } from "@/lib/db";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const workspace = await getWorkspace(user.id);
  const todayLabel = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric", timeZone: process.env.NEXT_PUBLIC_APP_TIME_ZONE || "Africa/Addis_Ababa" }).format(new Date());
  return <DashboardView user={user} workspace={workspace} todayLabel={todayLabel} />;
}
