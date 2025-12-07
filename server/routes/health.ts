
import { Router } from 'express';
import { DatabaseMaintenance } from '../utils/database-maintenance';
import { PerformanceMonitor } from '../middleware/performance';
import { Logger } from '../utils/logger';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: await DatabaseMaintenance.healthCheck()
      },
      performance: PerformanceMonitor.getMetrics(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        replit: !!process.env.REPLIT_DOMAINS
      },
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        gemini: !!process.env.GEMINI_API_KEY,
        perplexity: !!process.env.PERPLEXITY_API_KEY
      }
    };

    // Determine overall health status
    if (!health.database.connected) {
      health.status = 'unhealthy';
    } else if (health.performance.errorRate > 0.1) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  } catch (error) {
    Logger.error('Health check failed', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed'
    });
  }
});

router.get('/metrics', (req, res) => {
  res.json(PerformanceMonitor.getMetrics());
});

export default router;
