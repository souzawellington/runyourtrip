import { pgTable, varchar, boolean, timestamp, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("admin"), // super_admin, admin, moderator
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  loginAttempts: jsonb("login_attempts").default([]),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin audit logs
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  adminId: varchar("admin_id").references(() => adminUsers.id),
  action: varchar("action").notNull(), // login, logout, create, update, delete, etc.
  resource: varchar("resource"), // users, templates, settings, etc.
  resourceId: varchar("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin sessions for tracking active sessions
export const adminSessions = pgTable("admin_sessions", {
  id: varchar("id").primaryKey().default("gen_random_uuid()"),
  adminId: varchar("admin_id").references(() => adminUsers.id),
  token: varchar("token").unique().notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Types
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogs.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;

// Validation schemas
export const insertAdminUserSchema = createInsertSchema(adminUsers)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    email: z.string().email(),
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
    role: z.enum(["super_admin", "admin", "moderator"]),
  });

export type InsertAdminUserInput = z.infer<typeof insertAdminUserSchema>;