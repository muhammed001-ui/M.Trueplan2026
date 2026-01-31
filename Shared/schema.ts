import { pgTable, text, serial, integer, boolean, timestamp, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as auth from "./models/auth";

export const users = auth.users;
export const sessions = auth.sessions;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  content: text("content").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true, 
  createdAt: true,
  userId: true 
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTaskRequest = Partial<InsertTask>;

export interface TasksQueryParams {
  start?: string;
  end?: string;
}

export const identitySentences = [
  "Today is a new opportunity for clarity.",
  "Small actions lead to consistent results.",
  "Focus on the process, not the outcome.",
  "Discipline is the foundation of freedom.",
  "Observe without judgment, act with intent.",
  "Simplicity is the ultimate sophistication.",
  "One task at a time, with full presence."
];

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(),
  content: text("content").notNull(),
});

export const monthGoals = pgTable("month_goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  month: text("month").notNull(), // YYYY-MM
  content: text("content").notNull(),
});

export const insertRuleSchema = createInsertSchema(rules).omit({ id: true, userId: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, userId: true });
export const insertMonthGoalSchema = createInsertSchema(monthGoals).omit({ id: true, userId: true });

export type Rule = typeof rules.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type MonthGoal = typeof monthGoals.$inferSelect;
