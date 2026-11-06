import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: Readonly<{ children: ReactNode }>) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
