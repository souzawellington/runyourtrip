import winston from 'winston';
import expressWinston from 'express-winston';
import { Request, Response } from 'express';
import path from 'path';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Create logger instance with proper configuration
export const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      return `${timestamp} [${level.toUpperCase()}] ${message} ${metaString}`;
    })
  ),
  defaultMeta: { 
    service: 'runyourtrip',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for security events
    new winston.transports.File({
      filename: path.join('logs', 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join('logs', 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
});

// HTTP request logging middleware
export const httpLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: false,
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query'],
  responseWhitelist: ['statusCode', 'responseTime'],
  dynamicMeta: (req: Request, res: Response) => {
    return {
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
    };
  },
  skip: (req: Request) => {
    // Skip health check endpoints
    return req.url === '/api/health' || req.url === '/api/health/ready';
  },
});

// Error logging middleware
export const errorLogger = expressWinston.errorLogger({
  winstonInstance: logger,
  meta: true,
  msg: 'Error: {{err.message}}',
  requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query', 'body'],
  blacklistedMetaFields: ['password', 'token', 'secret', 'apiKey'],
});

// Security event logger
export const securityLogger = {
  logSuspiciousActivity: (event: string, details: any) => {
    logger.warn(`[SECURITY] ${event}`, {
      ...details,
      timestamp: new Date().toISOString(),
      category: 'security',
    });
  },
  
  logAuthFailure: (username: string, ip: string, reason: string) => {
    logger.warn('[SECURITY] Authentication failure', {
      username,
      ip,
      reason,
      timestamp: new Date().toISOString(),
      category: 'auth',
    });
  },
  
  logRateLimitExceeded: (ip: string, endpoint: string) => {
    logger.warn('[SECURITY] Rate limit exceeded', {
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
      category: 'rate-limit',
    });
  },
  
  logAccessDenied: (userId: string, resource: string, action: string) => {
    logger.warn('[SECURITY] Access denied', {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString(),
      category: 'access-control',
    });
  },
};

// Performance logger
export const performanceLogger = {
  logSlowQuery: (query: string, duration: number) => {
    if (duration > 1000) { // Log queries slower than 1 second
      logger.warn('[PERFORMANCE] Slow database query', {
        query,
        duration,
        timestamp: new Date().toISOString(),
        category: 'performance',
      });
    }
  },
  
  logSlowEndpoint: (endpoint: string, duration: number) => {
    if (duration > 3000) { // Log endpoints slower than 3 seconds
      logger.warn('[PERFORMANCE] Slow API endpoint', {
        endpoint,
        duration,
        timestamp: new Date().toISOString(),
        category: 'performance',
      });
    }
  },
  
  logHighMemoryUsage: (usage: number) => {
    const threshold = 0.85; // 85% memory usage threshold
    if (usage > threshold) {
      logger.error('[PERFORMANCE] High memory usage', {
        usage: `${(usage * 100).toFixed(2)}%`,
        timestamp: new Date().toISOString(),
        category: 'performance',
      });
    }
  },
};

// Export a simple log function for convenience
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

export default logger;