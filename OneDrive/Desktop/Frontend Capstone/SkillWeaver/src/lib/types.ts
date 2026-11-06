export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type GoalCategory = "Frontend" | "Backend" | "Career" | "University" | "Personal";
export type GoalStatus = "active" | "completed";
export type Priority = "low" | "medium" | "high";

export type Goal = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  goalId: string | null;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceData = {
  goals: Goal[];
  tasks: Task[];
};

export type GoalInput = Pick<Goal, "title" | "description" | "category" | "targetDate">;
export type TaskInput = Pick<Task, "title" | "description" | "goalId" | "priority" | "dueDate">;

export type GoalWithProgress = Goal & {
  progress: number;
  completedTasks: number;
  totalTasks: number;
};
