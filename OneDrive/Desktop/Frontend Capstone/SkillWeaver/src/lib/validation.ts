import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), "Enter a valid date.");
const optionalDate = z.union([dateOnly, z.literal("")]).nullable().optional();

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password.").max(72),
});

export const goalSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Use at least 3 characters.").max(90),
  description: z.string().trim().max(500).default(""),
  category: z.enum(["Frontend", "Backend", "Career", "University", "Personal"]),
  targetDate: optionalDate,
});

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Use at least 3 characters.").max(100),
  description: z.string().trim().max(500).default(""),
  goalId: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: optionalDate,
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(60),
});
