// Replit environment configuration
export const REPLIT_ENV = {
  isReplit: process.env.REPLIT_DEPLOYMENT === '1' || !!process.env.REPLIT_DOMAINS,
  domains: process.env.REPLIT_DOMAINS?.split(',') || [],
  replId: process.env.REPL_ID || 'local',
  baseUrl: process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000',
};

// Admin configuration for Replit
export const ADMIN_CONFIG = {
  // Initial admin credentials (change after first login!)
  defaultAdmin: {
    email: 'admin@runyourtrip.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'super_admin'
  },
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || process.env.SESSION_SECRET || 'replit-jwt-secret-change-in-production',
    expiresIn: '7d'
  },
  // Security settings
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
};

// API rate limits for Replit
export const RATE_LIMITS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5, // login attempts per window
  },
  ai: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // AI requests per minute
  }
};