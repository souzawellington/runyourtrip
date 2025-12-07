import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);
const router = Router();

// Security middleware
const MANAGEMENT_SECRET = process.env.MANAGEMENT_SECRET || "change-this-secret-immediately";

const authenticateManagement = (req: any, res: any, next: any) => {
  const token = req.headers["x-management-token"];
  if (token !== MANAGEMENT_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Apply authentication to all management routes
router.use(authenticateManagement);

// System status endpoint
router.get("/status", async (req, res) => {
  try {
    const status = {
      app: "running",
      timestamp: new Date().toISOString(),
      node: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg()
      },
      pm2: await getPM2Status(),
      database: await checkDatabaseStatus()
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Failed to get status", details: error.message });
  }
});

// Restart application
router.post("/restart", async (req, res) => {
  try {
    const { stdout } = await execAsync("pm2 restart all");
    res.json({ message: "Application restarted", output: stdout });
  } catch (error) {
    res.status(500).json({ error: "Failed to restart", details: error.message });
  }
});

// Deploy latest code
router.post("/deploy", async (req, res) => {
  try {
    const commands = [
      "git pull origin main",
      "npm install",
      "npm run build",
      "npm run db:push",
      "pm2 restart all"
    ];
    
    let output = "";
    for (const cmd of commands) {
      const { stdout } = await execAsync(cmd);
      output += `\n=== ${cmd} ===\n${stdout}`;
    }
    
    res.json({ message: "Deployment completed", output });
  } catch (error) {
    res.status(500).json({ error: "Deployment failed", details: error.message });
  }
});

// View logs
router.get("/logs/:type", async (req, res) => {
  const logType = req.params.type;
  const validTypes = ["app", "error", "nginx", "pm2", "access"];
  
  if (!validTypes.includes(logType)) {
    return res.status(400).json({ error: "Invalid log type" });
  }
  
  try {
    let command = "";
    switch (logType) {
      case "app":
        command = "pm2 logs --lines 100 --nostream";
        break;
      case "error":
        command = "pm2 logs --err --lines 100 --nostream";
        break;
      case "nginx":
        command = "tail -n 100 /var/log/nginx/access.log";
        break;
      case "pm2":
        command = "pm2 list";
        break;
      case "access":
        command = "tail -n 100 /var/log/nginx/access.log";
        break;
    }
    
    const { stdout } = await execAsync(command);
    res.json({ logs: stdout });
  } catch (error) {
    res.status(500).json({ error: "Failed to get logs", details: error.message });
  }
});

// Database operations
router.post("/database/backup", async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = `/tmp/runyourtrip-backup-${timestamp}.sql`;
    
    const { stdout } = await execAsync(
      `pg_dump ${process.env.DATABASE_URL} > ${backupFile}`
    );
    
    res.json({ 
      message: "Database backup created", 
      file: backupFile,
      size: (await fs.stat(backupFile)).size
    });
  } catch (error) {
    res.status(500).json({ error: "Backup failed", details: error.message });
  }
});

// Environment management
router.get("/env", async (req, res) => {
  try {
    const envPath = path.join(process.cwd(), ".env");
    const envContent = await fs.readFile(envPath, "utf-8");
    
    // Hide sensitive values
    const sanitized = envContent.split("\n").map(line => {
      if (line.includes("=")) {
        const [key, value] = line.split("=");
        const isPublic = ["NODE_ENV", "PORT", "DATABASE_URL"].includes(key);
        return `${key}=${isPublic ? value : "***"}`;
      }
      return line;
    }).join("\n");
    
    res.json({ env: sanitized });
  } catch (error) {
    res.status(500).json({ error: "Failed to read env", details: error.message });
  }
});

// Helper functions
async function getPM2Status() {
  try {
    const { stdout } = await execAsync("pm2 jlist");
    return JSON.parse(stdout);
  } catch (error) {
    return { error: error.message };
  }
}

async function checkDatabaseStatus() {
  try {
    const { db } = await import("../db");
    await db.query.users.findFirst();
    return { status: "connected", timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: "error", error: error.message };
  }
}

export default router;