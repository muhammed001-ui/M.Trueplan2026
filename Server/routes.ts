import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertRuleSchema, insertNoteSchema, insertMonthGoalSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. Protected Routes
  
  // GET /api/tasks
  app.get(api.tasks.list.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const query = api.tasks.list.input?.parse(req.query) || {};
      const tasks = await storage.getTasks(userId, query);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // POST /api/tasks (Upsert)
  app.post(api.tasks.upsert.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.tasks.upsert.input.parse(req.body);
      
      // Force userId from auth
      const taskData = { ...input, userId };
      
      const task = await storage.createTask(taskData);
      res.json(task); // 200 OK
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // DELETE /api/tasks/:id
  app.delete(api.tasks.delete.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });

      // Security check: ensure task belongs to user
      const task = await storage.getTask(id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      
      const userId = (req.user as any).claims.sub;
      if (task.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteTask(id, userId);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Rules
  app.get("/api/rules", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const rules = await storage.getRules(userId);
    res.json(rules);
  });

  app.post("/api/rules", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = insertRuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const rule = await storage.createRule(userId, parsed.data.content);
    res.status(201).json(rule);
  });

  app.delete("/api/rules/:id", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = parseInt(req.params.id);
    await storage.deleteRule(id, userId);
    res.sendStatus(204);
  });

  // Notes
  app.get("/api/notes/:date", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const note = await storage.getNote(userId, req.params.date);
    res.json(note || null);
  });

  app.post("/api/notes/:date", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = insertNoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const note = await storage.upsertNote(userId, req.params.date, parsed.data.content);
    res.json(note);
  });

  // Month Goals
  app.get("/api/month-goals/:month", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const goal = await storage.getMonthGoal(userId, req.params.month);
    res.json(goal || null);
  });

  app.post("/api/month-goals/:month", isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const parsed = insertMonthGoalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const goal = await storage.upsertMonthGoal(userId, req.params.month, parsed.data.content);
    res.json(goal);
  });

  return httpServer;
}
  
