import type { Goal, GoalWithProgress, Task, WorkspaceData } from "@/lib/types";

export function formatDate(value: string | null): string {
  if (!value) return "No deadline";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function getGoalProgress(goal: Goal, tasks: Task[]): GoalWithProgress {
  const linked = tasks.filter((task) => task.goalId === goal.id);
  const completedTasks = linked.filter((task) => task.completed).length;
  return {
    ...goal,
    progress: linked.length ? Math.round((completedTasks / linked.length) * 100) : 0,
    completedTasks,
    totalTasks: linked.length,
  };
}

export function appDateKey(date = new Date()): string {
  const timeZone = process.env.NEXT_PUBLIC_APP_TIME_ZONE || "Africa/Addis_Ababa";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function getWorkspaceStats(workspace: WorkspaceData) {
  const completedTasks = workspace.tasks.filter((task) => task.completed).length;
  const today = appDateKey();
  const dueToday = workspace.tasks.filter((task) => !task.completed && task.dueDate === today).length;
  const activeGoals = workspace.goals.length;
  const averageProgress = activeGoals
    ? Math.round(workspace.goals.reduce((sum, goal) => sum + getGoalProgress(goal, workspace.tasks).progress, 0) / activeGoals)
    : 0;
  return { completedTasks, totalTasks: workspace.tasks.length, activeGoals, averageProgress, dueToday };
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "SW";
}
