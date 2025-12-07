
import fs from 'fs';
import path from 'path';

export class Logger {
  private static logDir = path.join(process.cwd(), 'logs');
  
  static {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  static log(level: 'info' | 'warn' | 'error', message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      meta: meta || {},
      repl: process.env.REPL_ID,
      pid: process.pid
    };

    // Console output for development
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta ? meta : '');

    // File logging for production tracking
    const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    // Critical errors should be tracked separately
    if (level === 'error') {
      const errorFile = path.join(this.logDir, 'errors.log');
      fs.appendFileSync(errorFile, JSON.stringify(logEntry) + '\n');
    }
  }

  static info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  static warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  static error(message: string, error?: Error | any) {
    this.log('error', message, {
      stack: error?.stack,
      message: error?.message,
      code: error?.code
    });
  }

  static apiRequest(req: any, res: any, duration: number) {
    this.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.claims?.sub
    });
  }
}
