import { Router, Request, Response } from "express";
import { db } from "../db";
import { adminUsers, adminAuditLogs } from "@shared/admin-schema";
import { eq, desc, sql } from "drizzle-orm";
import { verifyAdminToken, requireRole, AdminRequest } from "../middleware/admin-auth";
import adminAuthRoutes from "./admin-auth";
import { asyncHandler } from "../utils/error-handler";
import os from "os";

const router = Router();

// Admin authentication routes (no token required)
router.use("/auth", adminAuthRoutes);

// Apply authentication to all other admin routes
router.use(verifyAdminToken);

// System health check endpoint
router.get("/health", asyncHandler(async (req: Request, res: Response) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    platform: {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      instance: process.env.REPL_ID || "local",
      uptime: process.uptime()
    },
    system: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    },
    database: {
      connected: true, // Will be updated with actual check
      url: process.env.DATABASE_URL ? "configured" : "not configured"
    },
    apiKeys: {
      openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
      gemini: process.env.GEMINI_API_KEY ? "configured" : "missing",
      perplexity: process.env.PERPLEXITY_API_KEY ? "configured" : "missing"
    }
  };

  res.json(health);
}));

// Get all admin users (super_admin only)
router.get("/users", requireRole(["super_admin"]), asyncHandler(async (req: AdminRequest, res: Response) => {
  const admins = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      firstName: adminUsers.firstName,
      lastName: adminUsers.lastName,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
      lastLogin: adminUsers.lastLogin,
      createdAt: adminUsers.createdAt
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt));

  res.json(admins);
}));

// Get audit logs
router.get("/audit-logs", requireRole(["admin", "super_admin"]), asyncHandler(async (req: AdminRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const offset = parseInt(req.query.offset as string) || 0;

  const logs = await db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(logs);
}));

// Get admin dashboard stats
router.get("/stats", asyncHandler(async (req: AdminRequest, res: Response) => {
  // Get counts using select queries
  const usersResult = await db.select({ count: db.sql<number>`count(*)::int` }).from(adminUsers);
  const logsResult = await db.select({ count: db.sql<number>`count(*)::int` }).from(adminAuditLogs);
  
  const usersCount = usersResult[0]?.count || 0;
  const logsCount = logsResult[0]?.count || 0;
  
  // Get recent activity
  const recentLogs = await db
    .select()
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(10);

  res.json({
    users: usersCount,
    totalLogs: logsCount,
    recentActivity: recentLogs
  });
}));

export default router;