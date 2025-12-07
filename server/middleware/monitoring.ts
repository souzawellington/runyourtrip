import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { Logger } from '../utils/logger';

interface RequestMetrics {
  startTime: number;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  userId?: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}

export class MonitoringService {
  private static metrics: Map<string, RequestMetrics> = new Map();
  private static requestCount = 0;
  private static errorCount = 0;
  private static successCount = 0;

  // Middleware to track requests
  static trackRequest(req: Request, res: Response, next: NextFunction) {
    const requestId = `${Date.now()}-${++MonitoringService.requestCount}`;
    const metrics: RequestMetrics = {
      startTime: Date.now(),
      method: req.method,
      path: req.path,
      userId: (req as any).user?.id,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress
    };

    MonitoringService.metrics.set(requestId, metrics);
    (req as any).requestId = requestId;

    // Track response
    const originalSend = res.send;
    res.send = function(data: any) {
      res.send = originalSend;
      
      const endTime = Date.now();
      const duration = endTime - metrics.startTime;
      
      metrics.statusCode = res.statusCode;
      metrics.duration = duration;

      // Update counters
      if (res.statusCode >= 200 && res.statusCode < 300) {
        MonitoringService.successCount++;
      } else if (res.statusCode >= 400) {
        MonitoringService.errorCount++;
      }

      // Log slow requests
      if (duration > 1000) {
        Logger.warn('Slow request detected', {
          ...metrics,
          requestId
        });
      }

      // Track in database for API endpoints
      if (req.path.startsWith('/api/') && (req as any).user?.id) {
        MonitoringService.trackAnalytics(req, res, metrics);
      }

      // Clean up old metrics
      MonitoringService.cleanupMetrics();

      return originalSend.call(this, data);
    };

    next();
  }

  // Track analytics in database
  private static async trackAnalytics(req: Request, res: Response, metrics: RequestMetrics) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return;

      // Track page views
      if (req.method === 'GET' && res.statusCode === 200) {
        await storage.createAnalyticsEvent({
          userId,
          eventType: 'view',
          eventData: {
            path: req.path,
            duration: metrics.duration,
            userAgent: metrics.userAgent
          }
        });
      }

      // Track API usage
      if (req.path.includes('/generate') || req.path.includes('/ai/')) {
        await storage.createAnalyticsEvent({
          userId,
          eventType: 'api_usage',
          eventData: {
            endpoint: req.path,
            method: req.method,
            duration: metrics.duration,
            statusCode: res.statusCode
          }
        });
      }

      // Track errors
      if (res.statusCode >= 400) {
        await storage.createAnalyticsEvent({
          userId,
          eventType: 'error',
          eventData: {
            path: req.path,
            method: req.method,
            statusCode: res.statusCode,
            error: metrics.error
          }
        });
      }

      // Update user session
      await storage.createUserSession({
        userId,
        sessionId: 'session-' + Date.now(),
        startTime: new Date(metrics.startTime),
        endTime: new Date(),
        duration: metrics.duration!,
        pageViews: 1,
        browser: req.headers['user-agent']?.split(' ')[0],
        deviceType: metrics.userAgent?.includes('Mobile') ? 'mobile' : 'desktop'
      });

    } catch (error) {
      Logger.error('Failed to track analytics', error);
    }
  }

  // Get current metrics
  static getMetrics() {
    const now = Date.now();
    const recentMetrics = Array.from(MonitoringService.metrics.values())
      .filter(m => now - m.startTime < 300000); // Last 5 minutes

    const avgResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / recentMetrics.length
      : 0;

    return {
      totalRequests: MonitoringService.requestCount,
      successfulRequests: MonitoringService.successCount,
      failedRequests: MonitoringService.errorCount,
      activeRequests: recentMetrics.filter(m => !m.duration).length,
      avgResponseTime: Math.round(avgResponseTime),
      recentRequests: recentMetrics.slice(-10).map(m => ({
        method: m.method,
        path: m.path,
        statusCode: m.statusCode,
        duration: m.duration,
        timestamp: new Date(m.startTime).toISOString()
      }))
    };
  }

  // Clean up old metrics
  private static cleanupMetrics() {
    const now = Date.now();
    const keysToDelete: string[] = [];

    MonitoringService.metrics.forEach((metrics, key) => {
      if (now - metrics.startTime > 600000) { // 10 minutes
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => MonitoringService.metrics.delete(key));
  }

  // Health check endpoint data
  static async getHealthStatus() {
    try {
      const [dbHealth, metrics, activeSessions] = await Promise.all([
        MonitoringService.checkDatabaseHealth(),
        MonitoringService.getMetrics(),
        storage.getActiveSessionsCount()
      ]);

      return {
        status: dbHealth ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbHealth,
        metrics,
        activeSessions,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
        },
        cpu: process.cpuUsage()
      };
    } catch (error) {
      Logger.error('Health check failed', error);
      return {
        status: 'unhealthy',
        error: (error as Error).message
      };
    }
  }

  // Check database health
  private static async checkDatabaseHealth(): Promise<boolean> {
    try {
      const user = await storage.getUser('health-check');
      return true;
    } catch {
      return false;
    }
  }
}

// Export middleware
export const monitoringMiddleware = MonitoringService.trackRequest;