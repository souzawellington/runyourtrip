import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { validateEnvironment, generateSessionSecret } from "./env-validation";
import { seedEnglishContent } from "./seed-english-content";
import { securityHeaders, corsOptions, requestSizeLimit, replitSecurityMiddleware } from "./utils/replit-security";
import { sanitizeInput, apiRateLimit } from "./middleware/validation";
import { sanitizationMiddleware } from "./utils/input-sanitization";
import { PerformanceMonitor } from "./middleware/performance";
import { DatabaseMaintenance } from "./utils/database-maintenance";
import { httpLogger, errorLogger, logger } from "./utils/centralized-logger";
import { configureDatabasePool } from "./utils/database-pool-config";
import compression from "compression";
import healthRoutes from "./routes/health";
import cors from "cors";

// Set default ISSUER_URL if not already set
if (!process.env.ISSUER_URL) {
  process.env.ISSUER_URL = "https://replit.com/oidc";
}

const app = express();

// Apply compression for better performance
app.use(compression());

// Apply CORS first for all routes
app.use(cors(corsOptions));

// Apply middleware in correct order
app.use(express.json(requestSizeLimit.json));
app.use(express.urlencoded(requestSizeLimit.urlencoded));

// Apply comprehensive input sanitization
app.use(sanitizeInput);
app.use(sanitizationMiddleware);

// Apply HTTP logging
app.use(httpLogger);

// Apply performance monitoring
app.use(PerformanceMonitor.middleware);

// Apply monitoring middleware
import { monitoringMiddleware } from "./middleware/monitoring";
app.use(monitoringMiddleware);

// Apply rate limiting only to API routes
app.use("/api/", apiRateLimit);

// Apply enhanced security headers
app.use(securityHeaders);
app.use(replitSecurityMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Validate environment variables on startup
  validateEnvironment();
  
  // Configure database connection pool
  configureDatabasePool();
  
  // Generate session secret if needed for development
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = generateSessionSecret();
  }
  
  logger.info('Starting RUN YOUR TRIP server', {
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
  });
  
  const server = await registerRoutes(app);
  
  // Seed English learning content for marketplace
  try {
    await seedEnglishContent();
  } catch (error) {
    console.log("English content already seeded or error occurred:", error);
  }
  
  // Seed admin user for Replit environment
  if (process.env.REPLIT_DOMAINS) {
    const { seedAdminUser } = await import("./seed-admin");
    await seedAdminUser();
  }

  // Initialize database maintenance
  DatabaseMaintenance.scheduleMaintenance();

  // Add health monitoring routes
  app.use("/api/health", healthRoutes);
  
  // Add monitoring routes
  const monitoringRoutes = (await import("./routes/monitoring")).default;
  app.use("/api/monitoring", monitoringRoutes);

  // Add error logging middleware
  app.use(errorLogger);
  
  // Import and use error handler
  const { errorHandler } = await import("./middleware/error-handler");
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
