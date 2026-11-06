import { BookOpen, ListTodo, Target } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: "goals" | "tasks" | "general";
};

export function EmptyState({ title, description, action, icon = "general" }: EmptyStateProps) {
  const Icon = icon === "goals" ? Target : icon === "tasks" ? ListTodo : BookOpen;
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={25} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
