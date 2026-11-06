import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Goal, GoalInput, Task, TaskInput, User, WorkspaceData } from "@/lib/types";

type StoredUser = User & { passwordHash: string };
type Database = {
  users: StoredUser[];
  workspaces: Record<string, WorkspaceData>;
};

const defaultDatabase = (): Database => ({ users: [], workspaces: {} });
const dataFile = process.env.SKILLWEAVER_DATA_FILE
  ? path.resolve(process.env.SKILLWEAVER_DATA_FILE)
  : path.join(process.cwd(), "data", "skillweaver.json");

let writeQueue: Promise<void> = Promise.resolve();

async function readDatabase(): Promise<Database> {
  await mkdir(path.dirname(dataFile), { recursive: true });
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Database;
    if (!Array.isArray(parsed.users) || typeof parsed.workspaces !== "object" || !parsed.workspaces) {
      throw new Error("The SkillWeaver data file has an invalid structure.");
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const initial = defaultDatabase();
      await writeFile(dataFile, JSON.stringify(initial, null, 2), { encoding: "utf8", mode: 0o600 });
      return initial;
    }
    throw error;
  }
}

async function writeDatabase(database: Database): Promise<void> {
  const temporary = `${dataFile}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(database, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(temporary, dataFile);
}

async function mutateDatabase<T>(mutator: (database: Database) => T | Promise<T>): Promise<T> {
  let result!: T;
  const operation = async () => {
    const database = await readDatabase();
    result = await mutator(database);
    await writeDatabase(database);
  };
  const pending = writeQueue.then(operation, operation);
  writeQueue = pending.then(() => undefined, () => undefined);
  await pending;
  return result;
}

export function publicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const database = await readDatabase();
  return database.users.find((user) => user.email === email.toLowerCase()) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const database = await readDatabase();
  const user = database.users.find((item) => item.id === id);
  return user ? publicUser(user) : null;
}

export async function createUser(input: { name: string; email: string; passwordHash: string }): Promise<User> {
  return mutateDatabase((database) => {
    if (database.users.some((user) => user.email === input.email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }
    const now = new Date().toISOString();
    const user: StoredUser = {
      id: randomUUID(),
      name: input.name.trim(),
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      createdAt: now,
    };
    database.users.push(user);
    database.workspaces[user.id] = { goals: [], tasks: [] };
    return publicUser(user);
  });
}

export async function getWorkspace(userId: string): Promise<WorkspaceData> {
  const database = await readDatabase();
  return database.workspaces[userId] ?? { goals: [], tasks: [] };
}

export async function addGoal(userId: string, input: GoalInput): Promise<Goal> {
  return mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    if (!workspace) throw new Error("Workspace not found.");
    const now = new Date().toISOString();
    const goal: Goal = {
      id: randomUUID(), userId, ...input,
      description: input.description ?? "",
      targetDate: input.targetDate || null,
      createdAt: now, updatedAt: now,
    };
    workspace.goals.unshift(goal);
    return goal;
  });
}

export async function updateGoal(userId: string, id: string, input: GoalInput): Promise<Goal> {
  return mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    const goal = workspace?.goals.find((item) => item.id === id && item.userId === userId);
    if (!goal) throw new Error("Goal not found.");
    Object.assign(goal, input, { description: input.description ?? "", targetDate: input.targetDate || null, updatedAt: new Date().toISOString() });
    return goal;
  });
}

export async function removeGoal(userId: string, id: string): Promise<void> {
  await mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    if (!workspace) throw new Error("Workspace not found.");
    workspace.goals = workspace.goals.filter((goal) => !(goal.id === id && goal.userId === userId));
    workspace.tasks = workspace.tasks.map((task) => task.goalId === id && task.userId === userId ? { ...task, goalId: null, updatedAt: new Date().toISOString() } : task);
  });
}

export async function addTask(userId: string, input: TaskInput): Promise<Task> {
  return mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    if (!workspace) throw new Error("Workspace not found.");
    if (input.goalId && !workspace.goals.some((goal) => goal.id === input.goalId && goal.userId === userId)) {
      throw new Error("Choose one of your own learning goals.");
    }
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(), userId, ...input,
      description: input.description ?? "",
      goalId: input.goalId || null,
      dueDate: input.dueDate || null,
      completed: false, completedAt: null,
      createdAt: now, updatedAt: now,
    };
    workspace.tasks.unshift(task);
    return task;
  });
}

export async function updateTask(userId: string, id: string, input: TaskInput & { completed?: boolean }): Promise<Task> {
  return mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    const task = workspace?.tasks.find((item) => item.id === id && item.userId === userId);
    if (!task) throw new Error("Task not found.");
    if (input.goalId && !workspace?.goals.some((goal) => goal.id === input.goalId && goal.userId === userId)) {
      throw new Error("Choose one of your own learning goals.");
    }
    const completed = input.completed ?? task.completed;
    Object.assign(task, input, {
      description: input.description ?? "",
      goalId: input.goalId || null,
      dueDate: input.dueDate || null,
      completed,
      completedAt: completed ? task.completedAt ?? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    });
    return task;
  });
}

export async function toggleTask(userId: string, id: string): Promise<Task> {
  return mutateDatabase((database) => {
    const task = database.workspaces[userId]?.tasks.find((item) => item.id === id && item.userId === userId);
    if (!task) throw new Error("Task not found.");
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    task.updatedAt = new Date().toISOString();
    return task;
  });
}

export async function removeTask(userId: string, id: string): Promise<void> {
  await mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    if (!workspace) throw new Error("Workspace not found.");
    workspace.tasks = workspace.tasks.filter((task) => !(task.id === id && task.userId === userId));
  });
}

export async function updateUserName(userId: string, name: string): Promise<User> {
  return mutateDatabase((database) => {
    const user = database.users.find((item) => item.id === userId);
    if (!user) throw new Error("Account not found.");
    user.name = name.trim();
    return publicUser(user);
  });
}

export async function resetWorkspace(userId: string): Promise<void> {
  await mutateDatabase((database) => {
    if (!database.workspaces[userId]) throw new Error("Workspace not found.");
    database.workspaces[userId] = { goals: [], tasks: [] };
  });
}

export async function loadSampleWorkspace(userId: string): Promise<WorkspaceData> {
  return mutateDatabase((database) => {
    const workspace = database.workspaces[userId];
    if (!workspace) throw new Error("Workspace not found.");
    if (workspace.goals.length || workspace.tasks.length) {
      throw new Error("Sample data can only be loaded into an empty workspace.");
    }
    const now = new Date();
    const iso = now.toISOString();
    const goalSpecs = [
      { title: "Build my React portfolio", description: "Create a clean portfolio with projects and a contact section.", category: "Frontend" as const, days: 21 },
      { title: "Strengthen JavaScript fundamentals", description: "Practice arrays, objects, async code, and DOM events.", category: "Frontend" as const, days: 30 },
      { title: "Prepare for junior developer roles", description: "Polish my CV, GitHub profile, and interview stories.", category: "Career" as const, days: 45 },
    ];
    const goals: Goal[] = goalSpecs.map((item, index) => ({
      id: randomUUID(), userId, title: item.title, description: item.description,
      category: item.category,
      targetDate: new Date(now.getTime() + item.days * 86400000).toISOString().slice(0, 10),
      createdAt: iso, updatedAt: iso,
    }));
    const taskSpecs = [
      { title: "Review component props and state", goal: 0, priority: "medium" as const, done: true, daysAgo: 1 },
      { title: "Build a reusable project card", goal: 0, priority: "high" as const, done: true, daysAgo: 0 },
      { title: "Practice array map and filter", goal: 1, priority: "medium" as const, done: false, daysAgo: 0 },
      { title: "Write one STAR interview story", goal: 2, priority: "low" as const, done: false, daysAgo: 1 },
      { title: "Update GitHub project README", goal: 0, priority: "high" as const, done: false, daysAgo: 2 },
    ];
    const tasks: Task[] = taskSpecs.map((item) => ({
      id: randomUUID(), userId, title: item.title, description: "", goalId: goals[item.goal].id,
      priority: item.priority, dueDate: new Date(now.getTime() + (item.daysAgo + 1) * 86400000).toISOString().slice(0, 10),
      completed: item.done, completedAt: item.done ? new Date(now.getTime() - item.daysAgo * 86400000).toISOString() : null,
      createdAt: iso, updatedAt: iso,
    }));
    database.workspaces[userId] = { goals, tasks };
    return { goals, tasks };
  });
}
