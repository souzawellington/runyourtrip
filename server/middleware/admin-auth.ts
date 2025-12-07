import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../db";
import { adminUsers } from "@shared/admin-schema";
import { eq } from "drizzle-orm";

// Generate a secure JWT secret if not provided
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_JWT_SECRET must be set in production environment');
  }
  // Only use generated secret for development
  const secret = crypto.randomBytes(32).toString('hex');
  console.warn('[SECURITY WARNING] Using generated JWT secret for development. Set ADMIN_JWT_SECRET in production!');
  return secret;
})();

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    email: string;
    role: string;
  };
}

// Verify JWT token
export const verifyAdminToken = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || 
                  req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify admin still exists and is active
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, decoded.id));

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: "Invalid or inactive admin account" });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Check if admin has required role
export const requireRole = (allowedRoles: string[]) => {
  return (req: AdminRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Rate limiting for admin login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const rateLimitLogin = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = new Date();
  const attempt = loginAttempts.get(ip);

  if (attempt) {
    const timeDiff = now.getTime() - attempt.lastAttempt.getTime();
    const minutes = timeDiff / 1000 / 60;

    if (minutes < 15 && attempt.count >= 5) {
      return res.status(429).json({ 
        error: "Too many login attempts. Please try again later." 
      });
    }

    if (minutes >= 15) {
      loginAttempts.delete(ip);
    }
  }

  next();
};

export const recordLoginAttempt = (ip: string | undefined, success: boolean) => {
  if (!ip) return;
  if (success) {
    loginAttempts.delete(ip);
    return;
  }

  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: new Date() };
  attempt.count++;
  attempt.lastAttempt = new Date();
  loginAttempts.set(ip, attempt);
};

// Generate admin token
export const generateAdminToken = (admin: any) => {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

// Verify password
export const verifyPassword = async (
  password: string, 
  hashedPassword: string | undefined
): Promise<boolean> => {
  if (!hashedPassword) return false;
  return await bcrypt.compare(password, hashedPassword);
};