import type { Metadata } from "next";
import { getSessionUser } from "@/lib/auth";
import { getWorkspace } from "@/lib/db";
import { TasksManager } from "@/components/tasks/TasksManager";

export const metadata: Metadata = { title: "Tasks", robots: { index: false, follow: false } };
type PageProps = { searchParams: Promise<{ q?: string }> };
export default async function TasksPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);
  if (!user) return null;
  const workspace = await getWorkspace(user.id);
  return <TasksManager initialTasks={workspace.tasks} goals={workspace.goals} searchQuery={params.q ?? ""} />;
}
