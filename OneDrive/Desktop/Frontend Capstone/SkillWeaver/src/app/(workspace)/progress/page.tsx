import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getWorkspace } from "@/lib/db";
import { ProgressView } from "@/components/progress/ProgressView";

export const metadata: Metadata = { title: "Progress", robots: { index: false, follow: false } };
export default async function ProgressPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const workspace = await getWorkspace(user.id);
  return <ProgressView workspace={workspace} />;
}
