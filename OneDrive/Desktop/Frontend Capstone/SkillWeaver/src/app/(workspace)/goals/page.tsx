import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getWorkspace } from "@/lib/db";
import { GoalsManager } from "@/components/goals/GoalsManager";

export const metadata: Metadata = { title: "Learning goals", robots: { index: false, follow: false } };
type PageProps = { searchParams: Promise<{ q?: string }> };
export default async function GoalsPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);
  if (!user) return null;
  const workspace = await getWorkspace(user.id);
  return <GoalsManager initialGoals={workspace.goals} tasks={workspace.tasks} searchQuery={params.q ?? ""} />;
}
