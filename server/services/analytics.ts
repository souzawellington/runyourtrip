import { storage } from "../storage";
import { InsertAnalyticsEvent, InsertRevenueMetric, InsertUserSession } from "@shared/schema";

export class AnalyticsService {
  // Track user events automatically
  async trackEvent(eventData: InsertAnalyticsEvent): Promise<void> {
    try {
      await storage.createAnalyticsEvent(eventData);
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  // Generate sample analytics data for demo purposes
  async generateSampleData(userId: string): Promise<void> {
    try {
      const today = new Date();
      
      // Generate sample events for the last 30 days
      for (let i = 0; i < 30; i++) {
        const eventDate = new Date(today);
        eventDate.setDate(eventDate.getDate() - i);

        // Random events for each day
        const eventTypes = ['view', 'download', 'generate', 'share'];
        const eventCount = Math.floor(Math.random() * 10) + 1;

        for (let j = 0; j < eventCount; j++) {
          const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          await storage.createAnalyticsEvent({
            userId,
            eventType: randomEventType,
            eventData: {
              type: randomEventType,
              timestamp: eventDate.toISOString(),
              synthetic: true // Mark as sample data
            },
            ipAddress: '127.0.0.1',
            userAgent: 'Sample Data Generator',
          });
        }

        // Generate revenue metrics
        await storage.createRevenueMetric({
          userId,
          date: eventDate,
          revenue: (Math.random() * 500 + 100).toFixed(2),
          sales: Math.floor(Math.random() * 10) + 1,
          views: Math.floor(Math.random() * 100) + 20,
          downloads: Math.floor(Math.random() * 30) + 5,
          conversionRate: (Math.random() * 10 + 2).toFixed(2),
        });
      }

      // Generate sample user sessions
      for (let i = 0; i < 50; i++) {
        const sessionDate = new Date(today);
        sessionDate.setDate(sessionDate.getDate() - Math.floor(Math.random() * 30));
        
        const duration = Math.floor(Math.random() * 3600) + 60; // 1 minute to 1 hour
        const pageViews = Math.floor(Math.random() * 20) + 1;
        const actions = Math.floor(Math.random() * 15) + 1;

        await storage.createUserSession({
          userId,
          sessionId: `session-${Date.now()}-${i}`,
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + duration * 1000),
          duration,
          pageViews,
          actions,
          deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
          country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
        });
      }

      console.log(`Generated sample analytics data for user ${userId}`);
    } catch (error) {
      console.error("Failed to generate sample data:", error);
    }
  }

  // Real-time analytics helpers
  async getEngagementScore(userId: string): Promise<number> {
    try {
      const sessionAnalytics = await storage.getSessionAnalytics(userId);
      const recentEvents = await storage.getAnalyticsEventsByUserId(userId, undefined, 100);
      
      // Calculate engagement score based on various factors
      const avgDuration = sessionAnalytics.avgDuration || 0;
      const totalActions = sessionAnalytics.totalActions || 0;
      const recentActivity = recentEvents.length;
      
      // Simple engagement score calculation (0-100)
      const score = Math.min(100, 
        (avgDuration / 3600) * 30 + // Duration factor (max 30 points)
        (totalActions / 100) * 40 + // Actions factor (max 40 points)
        (recentActivity / 50) * 30   // Recent activity factor (max 30 points)
      );
      
      return Math.round(score);
    } catch (error) {
      console.error("Failed to calculate engagement score:", error);
      return 0;
    }
  }

  // Performance insights
  async getPerformanceInsights(userId: string): Promise<any[]> {
    try {
      const templatePerformance = await storage.getTemplatePerformance(userId);
      const insights = [];
      
      // Top performing template
      if (templatePerformance.length > 0) {
        const topTemplate = templatePerformance[0];
        insights.push({
          type: 'success',
          title: 'Top Performer',
          message: `"${topTemplate.templateName}" is your highest revenue generator with $${topTemplate.totalRevenue}`,
        });
      }
      
      // Conversion rate insights
      const revenueMetrics = await storage.getDailyRevenueMetrics(userId, 7);
      const avgConversion = revenueMetrics.reduce((sum, metric) => 
        sum + parseFloat(metric.conversionRate || "0"), 0) / revenueMetrics.length;
      
      if (avgConversion > 5) {
        insights.push({
          type: 'info',
          title: 'Strong Conversion',
          message: `Your 7-day average conversion rate of ${avgConversion.toFixed(1)}% is above industry average`,
        });
      } else {
        insights.push({
          type: 'warning',
          title: 'Optimize Conversion',
          message: `Consider improving your templates to boost the ${avgConversion.toFixed(1)}% conversion rate`,
        });
      }
      
      return insights;
    } catch (error) {
      console.error("Failed to get performance insights:", error);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();