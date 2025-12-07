import { Router, Request, Response } from 'express';
import { MonitoringService } from '../middleware/monitoring';
import { isAuthenticated } from '../replitAuth';
import { asyncHandler } from '../middleware/error-handler';
import { storage } from '../storage';

const router = Router();

// Get system health status
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const health = await MonitoringService.getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
}));

// Get current metrics (protected)
router.get('/metrics', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const metrics = MonitoringService.getMetrics();
  res.json(metrics);
}));

// Get user analytics (protected)
router.get('/analytics/user/:userId', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { period = '7d' } = req.query;
  
  // Verify user has access to these analytics
  if ((req as any).user.id !== userId && !(req as any).user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [events, sessions, revenue] = await Promise.all([
    storage.getAnalyticsEventsByUserId(userId, undefined, 1000),
    storage.getUserSessions(userId, 100),
    storage.getRevenueMetrics(userId, startDate)
  ]);

  res.json({
    period,
    events: events.length,
    sessions: sessions.length,
    totalRevenue: revenue.reduce((sum, r) => sum + parseFloat(r.revenue), 0).toFixed(2),
    eventBreakdown: events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentSessions: sessions.slice(0, 5)
  });
}));

// Get template analytics (protected)
router.get('/analytics/template/:templateId', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const templateId = parseInt(req.params.templateId);
  const template = await storage.getTemplate(templateId);
  
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }

  // Verify user owns the template
  if (template.userId !== (req as any).user.id && !(req as any).user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const [events, analytics] = await Promise.all([
    storage.getAnalyticsEventsByTemplate(templateId),
    storage.getAnalyticsByTemplateId(templateId)
  ]);

  res.json({
    templateId,
    totalViews: template.views,
    totalDownloads: template.downloads,
    totalRevenue: template.revenue,
    rating: template.rating,
    events: events.length,
    eventBreakdown: events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    dailyAnalytics: analytics
  });
}));

// Get real-time dashboard data (protected)
router.get('/dashboard', isAuthenticated, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  const [metrics, realTimeData, comparison] = await Promise.all([
    MonitoringService.getMetrics(),
    storage.getRealTimeMetrics(userId),
    storage.getComparisonMetrics(userId, 'week')
  ]);

  res.json({
    system: metrics,
    realTime: realTimeData,
    comparison,
    timestamp: new Date().toISOString()
  });
}));

export default router;