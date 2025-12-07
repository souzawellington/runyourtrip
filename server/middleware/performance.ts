
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  memoryUsage: NodeJS.MemoryUsage;
  timestamp: Date;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000;

  static middleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding: any) {
      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();

      // Log slow requests (> 2 seconds)
      if (duration > 2000) {
        Logger.warn(`Slow request detected: ${req.method} ${req.path}`, {
          duration,
          statusCode: res.statusCode,
          memoryDelta: {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed
          }
        });
      }

      // Store performance metrics
      PerformanceMonitor.addMetric({
        endpoint: req.path,
        method: req.method,
        duration,
        statusCode: res.statusCode,
        memoryUsage: endMemory,
        timestamp: new Date()
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  private static addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  static getMetrics() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length,
      slowRequests: this.metrics.filter(m => m.duration > 1000).length,
      errorRate: this.metrics.filter(m => m.statusCode >= 400).length / this.metrics.length,
      currentMemory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}
