import { Router } from "express";
import { db } from "../db";
import { adminUsers, adminAuditLogs } from "@shared/admin-schema";
import { eq } from "drizzle-orm";
import {
  verifyAdminToken,
  requireRole,
  rateLimitLogin,
  recordLoginAttempt,
  generateAdminToken,
  hashPassword,
  verifyPassword,
  AdminRequest
} from "../middleware/admin-auth";

const router = Router();

// Admin login
router.post("/login", rateLimitLogin, async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || "unknown";
  
  try {
    if (!email || !password) {
      recordLoginAttempt(ip, false);
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find admin user
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.email, email));

    if (!admin || !admin.isActive) {
      recordLoginAttempt(ip, false);
      
      // Log failed attempt
      await db.insert(adminAuditLogs).values({
        action: "login_failed",
        resource: "admin_auth",
        details: { email, reason: "user_not_found" },
        ipAddress: ip,
        userAgent: req.headers["user-agent"]
      });
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const validPassword = await verifyPassword(password, admin.password);
    if (!validPassword) {
      recordLoginAttempt(ip, false);
      
      // Log failed attempt
      await db.insert(adminAuditLogs).values({
        adminId: admin.id,
        action: "login_failed",
        resource: "admin_auth",
        details: { reason: "invalid_password" },
        ipAddress: ip,
        userAgent: req.headers["user-agent"]
      });
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    recordLoginAttempt(ip, true);

    // Update last login
    await db
      .update(adminUsers)
      .set({ lastLogin: new Date() })
      .where(eq(adminUsers.id, admin.id));

    // Generate token
    const token = generateAdminToken(admin);

    // Log successful login
    await db.insert(adminAuditLogs).values({
      adminId: admin.id,
      action: "login_success",
      resource: "admin_auth",
      ipAddress: ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Verify token
router.get("/verify", verifyAdminToken, async (req: AdminRequest, res) => {
  res.json({ valid: true, admin: req.admin });
});

// Logout
router.post("/logout", verifyAdminToken, async (req: AdminRequest, res) => {
  try {
    // Log logout
    await db.insert(adminAuditLogs).values({
      adminId: req.admin!.id,
      action: "logout",
      resource: "admin_auth",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// Change password
router.post("/change-password", verifyAdminToken, async (req: AdminRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Get current admin
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, req.admin!.id));

    // Verify current password
    const validPassword = await verifyPassword(currentPassword, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db
      .update(adminUsers)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(adminUsers.id, admin.id));

    // Log password change
    await db.insert(adminAuditLogs).values({
      adminId: admin.id,
      action: "password_changed",
      resource: "admin_auth",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;