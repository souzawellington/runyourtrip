import {
  users, templates, projects, analytics, generatedImages, trendingTopics,
  analyticsEvents, revenueMetrics, userSessions, reviews, purchases,
  workspaces, workspaceMembers, workspaceInvitations, workspaceActivity,
  brandAssets, brandConfigurations, brandApplicationHistory,
  type User, type UpsertUser, type Template, type InsertTemplate,
  type Project, type InsertProject, type Analytics, type InsertAnalytics,
  type GeneratedImage, type InsertGeneratedImage, type TrendingTopic, type InsertTrendingTopic,
  type AnalyticsEvent, type InsertAnalyticsEvent, type RevenueMetric, type InsertRevenueMetric,
  type UserSession, type InsertUserSession,
  type Review, type InsertReview, type Purchase,
  type Workspace, type InsertWorkspace, type WorkspaceMember, type InsertWorkspaceMember,
  type WorkspaceInvitation, type InsertWorkspaceInvitation, type WorkspaceActivity, type InsertWorkspaceActivity,
  type BrandAsset, type InsertBrandAsset, type BrandConfiguration, type InsertBrandConfiguration,
  type BrandApplicationHistory, type InsertBrandApplicationHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum, sql, and, avg } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeAccount(userId: string, data: {
    stripeAccountId?: string;
    stripeAccountStatus?: string;
    stripeOnboardingCompleted?: boolean;
  }): Promise<User | undefined>;
  updateUserStripeSubscription(userId: string, subscriptionId: string): Promise<User | undefined>;

  // Templates
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplatesByUserId(userId: string): Promise<Template[]>;
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: Partial<Template>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;

  // Projects
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;

  // Analytics
  getAnalyticsByUserId(userId: string): Promise<Analytics[]>;
  getAnalyticsByTemplateId(templateId: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getDailyStats(userId: string): Promise<{ views: number; downloads: number; revenue: string }>;
  getWeeklyRevenue(userId: string): Promise<string>;

  // AI Image Generation
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  getGeneratedImages(limit?: number): Promise<GeneratedImage[]>;
  getGeneratedImagesByUserId(userId: string, limit?: number): Promise<GeneratedImage[]>;
  getTrendingTopics(): Promise<TrendingTopic[]>;
  updateTrendingTopics(topics: InsertTrendingTopic[]): Promise<void>;

  // Advanced Analytics
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEventsByUserId(userId: string, eventType?: string, limit?: number): Promise<AnalyticsEvent[]>;
  getAnalyticsEventsByTemplate(templateId: number, eventType?: string): Promise<AnalyticsEvent[]>;

  createRevenueMetric(metric: InsertRevenueMetric): Promise<RevenueMetric>;
  getRevenueMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<RevenueMetric[]>;
  getDailyRevenueMetrics(userId: string, days?: number): Promise<RevenueMetric[]>;
  getTemplatePerformance(userId: string): Promise<any[]>;

  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: string, limit?: number): Promise<UserSession[]>;
  getActiveSessionsCount(): Promise<number>;
  getSessionAnalytics(userId: string): Promise<any>;

  getAdvancedAnalytics(userId: string): Promise<any>;
  getRealTimeMetrics(userId: string): Promise<any>;
  getComparisonMetrics(userId: string, period: 'week' | 'month' | 'quarter'): Promise<any>;

  // Workspace management
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspacesByUserId(userId: string): Promise<Workspace[]>;
  updateWorkspace(id: number, updates: Partial<Workspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: number): Promise<boolean>;

  // Workspace members
  addWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember>;
  getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]>;
  getWorkspaceMember(workspaceId: number, userId: string): Promise<WorkspaceMember | undefined>;
  updateWorkspaceMember(id: number, updates: Partial<WorkspaceMember>): Promise<WorkspaceMember | undefined>;
  removeWorkspaceMember(workspaceId: number, userId: string): Promise<boolean>;

  // Workspace invitations
  createWorkspaceInvitation(invitation: InsertWorkspaceInvitation): Promise<WorkspaceInvitation>;
  getWorkspaceInvitation(token: string): Promise<WorkspaceInvitation | undefined>;
  getWorkspaceInvitations(workspaceId: number): Promise<WorkspaceInvitation[]>;
  updateInvitationStatus(token: string, status: string): Promise<boolean>;

  // Workspace activity
  logWorkspaceActivity(activity: InsertWorkspaceActivity): Promise<WorkspaceActivity>;
  getWorkspaceActivity(workspaceId: number, limit?: number): Promise<WorkspaceActivity[]>;

  // Permission checks
  checkWorkspacePermission(userId: string, workspaceId: number, permission: string): Promise<boolean>;
  getUserWorkspaceRole(userId: string, workspaceId: number): Promise<string | null>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByTemplateId(templateId: number): Promise<Review[]>;
  getReviewByUserAndTemplate(userId: string, templateId: number): Promise<Review | undefined>;
  updateTemplateRating(templateId: number): Promise<void>;
  hasUserPurchasedTemplate(userId: string, templateId: number): Promise<boolean>;

  // Brand Assets
  createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset>;
  getBrandAssetById(id: number): Promise<BrandAsset | undefined>;
  getBrandAssetsByType(type: string): Promise<BrandAsset[]>;
  getBrandAssetsByCategory(category: string): Promise<BrandAsset[]>;
  getAllBrandAssets(): Promise<BrandAsset[]>;
  updateBrandAsset(id: number, updates: Partial<BrandAsset>): Promise<BrandAsset | undefined>;
  deleteBrandAsset(id: number): Promise<boolean>;

  // Brand Configurations
  createBrandConfiguration(config: InsertBrandConfiguration): Promise<BrandConfiguration>;
  getBrandConfigurationById(id: number): Promise<BrandConfiguration | undefined>;
  getActiveBrandConfiguration(): Promise<BrandConfiguration | undefined>;
  getDefaultBrandConfiguration(): Promise<BrandConfiguration | undefined>;
  getAllBrandConfigurations(): Promise<BrandConfiguration[]>;
  updateBrandConfiguration(id: number, updates: Partial<BrandConfiguration>): Promise<BrandConfiguration | undefined>;
  setActiveBrandConfiguration(id: number): Promise<boolean>;
  setDefaultBrandConfiguration(id: number): Promise<boolean>;
  deleteBrandConfiguration(id: number): Promise<boolean>;

  // Brand Application History
  createBrandApplicationHistory(history: InsertBrandApplicationHistory): Promise<BrandApplicationHistory>;
  getBrandApplicationHistory(): Promise<BrandApplicationHistory[]>;
  rollbackBrandConfiguration(historyId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeAccount(userId: string, data: {
    stripeAccountId?: string;
    stripeAccountStatus?: string;
    stripeOnboardingCompleted?: boolean;
  }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async updateUserStripeSubscription(userId: string, subscriptionId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Templates
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getTemplatesByUserId(userId: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.userId, userId)).orderBy(desc(templates.id));
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(desc(templates.id));
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.category, category)).orderBy(desc(templates.id));
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async updateTemplate(id: number, updates: Partial<Template>): Promise<Template | undefined> {
    const [template] = await db
      .update(templates)
      .set(updates)
      .where(eq(templates.id, id))
      .returning();
    return template || undefined;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    const result = await db.delete(templates).where(eq(templates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Projects
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.id));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  // Analytics
  async getAnalyticsByUserId(userId: string): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.userId, userId)).orderBy(desc(analytics.id));
  }

  async getAnalyticsByTemplateId(templateId: number): Promise<Analytics[]> {
    return await db.select().from(analytics).where(eq(analytics.templateId, templateId)).orderBy(desc(analytics.id));
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analyticsRecord] = await db
      .insert(analytics)
      .values(insertAnalytics)
      .returning();
    return analyticsRecord;
  }

  async getDailyStats(userId: string): Promise<{ views: number; downloads: number; revenue: string }> {
    const result = await db
      .select({
        totalViews: sql<number>`COALESCE(SUM(${analytics.views}), 0)`,
        totalDownloads: sql<number>`COALESCE(SUM(${analytics.downloads}), 0)`,
        totalRevenue: sql<string>`COALESCE(SUM(${analytics.revenue}::numeric), 0)::text`
      })
      .from(analytics)
      .where(eq(analytics.userId, userId));

    const stats = result[0];
    return {
      views: Number(stats.totalViews) || 0,
      downloads: Number(stats.totalDownloads) || 0,
      revenue: stats.totalRevenue || "0.00"
    };
  }

  async getWeeklyRevenue(userId: string): Promise<string> {
    const result = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${analytics.revenue}::numeric), 0)::text`
      })
      .from(analytics)
      .where(eq(analytics.userId, userId));

    return result[0]?.totalRevenue || "0.00";
  }

  // AI Image Generation methods
  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const [createdImage] = await db
      .insert(generatedImages)
      .values(image)
      .returning();
    return createdImage;
  }

  async getGeneratedImages(limit: number = 20): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }

  async getGeneratedImagesByUserId(userId: string, limit: number = 20): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    return await db
      .select()
      .from(trendingTopics)
      .orderBy(desc(trendingTopics.createdAt))
      .limit(10);
  }

  async updateTrendingTopics(topics: InsertTrendingTopic[]): Promise<void> {
    // Clear existing topics and insert new ones
    await db.delete(trendingTopics);
    if (topics.length > 0) {
      await db.insert(trendingTopics).values(topics);
    }
  }

  // Advanced Analytics Implementation
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [createdEvent] = await db
      .insert(analyticsEvents)
      .values(event)
      .returning();
    return createdEvent;
  }

  async getAnalyticsEventsByUserId(userId: string, eventType?: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    const conditions = [eq(analyticsEvents.userId, userId)];

    if (eventType) {
      conditions.push(eq(analyticsEvents.eventType, eventType));
    }

    return await db
      .select()
      .from(analyticsEvents)
      .where(and(...conditions))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(limit);
  }

  async getAnalyticsEventsByTemplate(templateId: number, eventType?: string): Promise<AnalyticsEvent[]> {
    const conditions = [eq(analyticsEvents.templateId, templateId)];

    if (eventType) {
      conditions.push(eq(analyticsEvents.eventType, eventType));
    }

    return await db
      .select()
      .from(analyticsEvents)
      .where(and(...conditions))
      .orderBy(desc(analyticsEvents.createdAt));
  }

  async createRevenueMetric(metric: InsertRevenueMetric): Promise<RevenueMetric> {
    const [createdMetric] = await db
      .insert(revenueMetrics)
      .values(metric)
      .returning();
    return createdMetric;
  }

  async getRevenueMetrics(userId: string, startDate?: Date, endDate?: Date): Promise<RevenueMetric[]> {
    const conditions = [eq(revenueMetrics.userId, userId)];

    if (startDate) {
      conditions.push(sql`${revenueMetrics.date} >= ${startDate}`);
    }
    if (endDate) {
      conditions.push(sql`${revenueMetrics.date} <= ${endDate}`);
    }

    return await db
      .select()
      .from(revenueMetrics)
      .where(and(...conditions))
      .orderBy(desc(revenueMetrics.date));
  }

  async getDailyRevenueMetrics(userId: string, days: number = 30): Promise<RevenueMetric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db
      .select()
      .from(revenueMetrics)
      .where(
        and(
          eq(revenueMetrics.userId, userId),
          sql`${revenueMetrics.date} >= ${startDate}`
        )
      )
      .orderBy(desc(revenueMetrics.date));
  }

  async getTemplatePerformance(userId: string): Promise<any[]> {
    return await db
      .select({
        templateId: templates.id,
        templateName: templates.name,
        category: templates.category,
        totalViews: sql<number>`COALESCE(SUM(${revenueMetrics.views}), 0)`,
        totalDownloads: sql<number>`COALESCE(SUM(${revenueMetrics.downloads}), 0)`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(${revenueMetrics.revenue} AS DECIMAL)), 0)`,
        avgConversionRate: sql<string>`COALESCE(AVG(CAST(${revenueMetrics.conversionRate} AS DECIMAL)), 0)`,
      })
      .from(templates)
      .leftJoin(revenueMetrics, eq(templates.id, revenueMetrics.templateId))
      .where(eq(templates.userId, userId))
      .groupBy(templates.id, templates.name, templates.category)
      .orderBy(sql`COALESCE(SUM(CAST(${revenueMetrics.revenue} AS DECIMAL)), 0) DESC`);
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [createdSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return createdSession;
  }

  async getUserSessions(userId: string, limit: number = 50): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.startTime))
      .limit(limit);
  }

  async getActiveSessionsCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(userSessions)
      .where(sql`${userSessions.endTime} IS NULL`);
    return result[0]?.count || 0;
  }

  async getSessionAnalytics(userId: string): Promise<any> {
    const result = await db
      .select({
        totalSessions: sql<number>`COUNT(*)`,
        avgDuration: sql<number>`AVG(${userSessions.duration})`,
        totalPageViews: sql<number>`SUM(${userSessions.pageViews})`,
        totalActions: sql<number>`SUM(${userSessions.actions})`,
      })
      .from(userSessions)
      .where(eq(userSessions.userId, userId));

    return result[0] || { totalSessions: 0, avgDuration: 0, totalPageViews: 0, totalActions: 0 };
  }

  async getAdvancedAnalytics(userId: string): Promise<any> {
    const [templatePerformance, revenueMetrics, sessionAnalytics] = await Promise.all([
      this.getTemplatePerformance(userId),
      this.getDailyRevenueMetrics(userId, 30),
      this.getSessionAnalytics(userId),
    ]);

    const totalRevenue = revenueMetrics.reduce((sum, metric) => sum + parseFloat(metric.revenue || "0"), 0);
    const totalViews = revenueMetrics.reduce((sum, metric) => sum + (metric.views || 0), 0);
    const totalDownloads = revenueMetrics.reduce((sum, metric) => sum + (metric.downloads || 0), 0);

    return {
      overview: {
        totalRevenue: totalRevenue.toFixed(2),
        totalViews,
        totalDownloads,
        conversionRate: totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(2) : "0",
        activeTemplates: templatePerformance.length,
      },
      templatePerformance,
      dailyMetrics: revenueMetrics.slice(0, 7), // Last 7 days
      sessionAnalytics,
    };
  }

  async getRealTimeMetrics(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayEvents, activeSessions] = await Promise.all([
      this.getAnalyticsEventsByUserId(userId, undefined, 100),
      this.getActiveSessionsCount(),
    ]);

    const todayViews = todayEvents.filter(e => e.eventType === 'view' && new Date(e.createdAt!) >= today).length;
    const todayDownloads = todayEvents.filter(e => e.eventType === 'download' && new Date(e.createdAt!) >= today).length;
    const todayGenerations = todayEvents.filter(e => e.eventType === 'generate' && new Date(e.createdAt!) >= today).length;

    return {
      todayViews,
      todayDownloads,
      todayGenerations,
      activeSessions,
      recentEvents: todayEvents.slice(0, 10),
    };
  }

  async getComparisonMetrics(userId: string, period: 'week' | 'month' | 'quarter'): Promise<any> {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const currentPeriod = await this.getDailyRevenueMetrics(userId, days);

    const previousStart = new Date();
    previousStart.setDate(previousStart.getDate() - days * 2);
    const previousEnd = new Date();
    previousEnd.setDate(previousEnd.getDate() - days);

    const previousPeriod = await this.getRevenueMetrics(userId, previousStart, previousEnd);

    const calculateTotal = (metrics: RevenueMetric[], field: keyof RevenueMetric) =>
      metrics.reduce((sum, metric) => {
        const value = metric[field];
        if (typeof value === 'string') {
          return sum + (parseFloat(value) || 0);
        } else if (typeof value === 'number') {
          return sum + value;
        }
        return sum;
      }, 0);

    const currentRevenue = calculateTotal(currentPeriod, 'revenue');
    const previousRevenue = calculateTotal(previousPeriod, 'revenue');
    const currentViews = calculateTotal(currentPeriod, 'views');
    const previousViews = calculateTotal(previousPeriod, 'views');

    return {
      current: {
        revenue: currentRevenue.toFixed(2),
        views: currentViews,
        downloads: calculateTotal(currentPeriod, 'downloads'),
      },
      previous: {
        revenue: previousRevenue.toFixed(2),
        views: previousViews,
        downloads: calculateTotal(previousPeriod, 'downloads'),
      },
      growth: {
        revenue: previousRevenue > 0 ? (((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1) : "0",
        views: previousViews > 0 ? (((currentViews - previousViews) / previousViews) * 100).toFixed(1) : "0",
      },
    };
  }

  // Workspace management implementation
  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const [result] = await db.insert(workspaces).values(workspace).returning();
    return result;
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    const results = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        description: workspaces.description,
        ownerId: workspaces.ownerId,
        status: workspaces.status,
        settings: workspaces.settings,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(workspaces)
      .leftJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.status, "active")
        )
      );
    return results;
  }

  async updateWorkspace(id: number, updates: Partial<Workspace>): Promise<Workspace | undefined> {
    const [result] = await db
      .update(workspaces)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    return result;
  }

  async deleteWorkspace(id: number): Promise<boolean> {
    const result = await db.delete(workspaces).where(eq(workspaces.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Workspace members
  async addWorkspaceMember(member: InsertWorkspaceMember): Promise<WorkspaceMember> {
    const [result] = await db.insert(workspaceMembers).values(member).returning();
    return result;
  }

  async getWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
    return await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.status, "active")
        )
      );
  }

  async getWorkspaceMember(workspaceId: number, userId: string): Promise<WorkspaceMember | undefined> {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.status, "active")
        )
      );
    return member;
  }

  async updateWorkspaceMember(id: number, updates: Partial<WorkspaceMember>): Promise<WorkspaceMember | undefined> {
    const [result] = await db
      .update(workspaceMembers)
      .set(updates)
      .where(eq(workspaceMembers.id, id))
      .returning();
    return result;
  }

  async removeWorkspaceMember(workspaceId: number, userId: string): Promise<boolean> {
    const result = await db
      .update(workspaceMembers)
      .set({ status: "suspended" })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );
    return (result.rowCount ?? 0) > 0;
  }

  // Workspace invitations
  async createWorkspaceInvitation(invitation: InsertWorkspaceInvitation): Promise<WorkspaceInvitation> {
    const [result] = await db.insert(workspaceInvitations).values(invitation).returning();
    return result;
  }

  async getWorkspaceInvitation(token: string): Promise<WorkspaceInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.token, token));
    return invitation;
  }

  async getWorkspaceInvitations(workspaceId: number): Promise<WorkspaceInvitation[]> {
    return await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.workspaceId, workspaceId))
      .orderBy(desc(workspaceInvitations.createdAt));
  }

  async updateInvitationStatus(token: string, status: string): Promise<boolean> {
    const result = await db
      .update(workspaceInvitations)
      .set({ status })
      .where(eq(workspaceInvitations.token, token));
    return (result.rowCount ?? 0) > 0;
  }

  // Workspace activity
  async logWorkspaceActivity(activity: InsertWorkspaceActivity): Promise<WorkspaceActivity> {
    const [result] = await db.insert(workspaceActivity).values(activity).returning();
    return result;
  }

  async getWorkspaceActivity(workspaceId: number, limit: number = 50): Promise<WorkspaceActivity[]> {
    return await db
      .select()
      .from(workspaceActivity)
      .where(eq(workspaceActivity.workspaceId, workspaceId))
      .orderBy(desc(workspaceActivity.createdAt))
      .limit(limit);
  }

  // Permission checks
  async checkWorkspacePermission(userId: string, workspaceId: number, permission: string): Promise<boolean> {
    const member = await this.getWorkspaceMember(workspaceId, userId);
    if (!member) return false;

    // Role-based permissions
    const rolePermissions: Record<string, string[]> = {
      owner: ["read", "write", "admin", "manage_members", "delete"],
      admin: ["read", "write", "manage_members"],
      editor: ["read", "write"],
      viewer: ["read"],
    };

    const userPermissions = rolePermissions[member.role] || [];
    return userPermissions.includes(permission);
  }

  async getUserWorkspaceRole(userId: string, workspaceId: number): Promise<string | null> {
    const member = await this.getWorkspaceMember(workspaceId, userId);
    return member?.role || null;
  }

  // Reviews implementation
  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    await this.updateTemplateRating(review.templateId);
    return result;
  }

  async getReviewsByTemplateId(templateId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.templateId, templateId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewByUserAndTemplate(userId: string, templateId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.templateId, templateId)
        )
      );
    return review;
  }

  async updateTemplateRating(templateId: number): Promise<void> {
    const avgResult = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.templateId, templateId));

    const avgRating = avgResult[0]?.avgRating || 0;

    await db
      .update(templates)
      .set({
        rating: String(Number(avgRating).toFixed(2)),
        updatedAt: new Date()
      })
      .where(eq(templates.id, templateId));
  }

  async hasUserPurchasedTemplate(userId: string, templateId: number): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(
        and(
          eq(purchases.userId, userId),
          eq(purchases.templateId, templateId),
          eq(purchases.status, 'completed')
        )
      );
    return !!purchase;
  }

  // Purchases implementation
  async createPurchase(purchase: Omit<Purchase, 'id' | 'purchaseDate'>): Promise<Purchase> {
    const [result] = await db.insert(purchases).values(purchase).returning();
    return result;
  }

  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async getPurchasesByUserId(userId: string): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.purchaseDate));
  }

  async getPurchaseByTransactionId(transactionId: string): Promise<Purchase | undefined> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.transactionId, transactionId));
    return purchase || undefined;
  }

  // Subscriptions implementation
  async upsertSubscription(subscription: any): Promise<any> {
    // Import subscriptions table from schema
    const { subscriptions } = await import('@shared/schema');

    // Check if subscription exists for this user
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, subscription.userId));

    if (existing.length > 0) {
      // Update existing
      const [result] = await db
        .update(subscriptions)
        .set({
          ...subscription,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, subscription.userId))
        .returning();
      return result;
    } else {
      // Insert new
      const [result] = await db
        .insert(subscriptions)
        .values(subscription)
        .returning();
      return result;
    }
  }

  async updateSubscriptionStatus(userId: string, status: string): Promise<boolean> {
    const { subscriptions } = await import('@shared/schema');

    const result = await db
      .update(subscriptions)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.userId, userId));

    return (result.rowCount ?? 0) > 0;
  }

  async getSubscriptionTierByPriceId(priceId: string): Promise<any | undefined> {
    const { subscriptionTiers } = await import('@shared/schema');

    const [tier] = await db
      .select()
      .from(subscriptionTiers)
      .where(eq(subscriptionTiers.stripePriceId, priceId));

    return tier || undefined;
  }

  async getSubscriptionByUserId(userId: string): Promise<any | undefined> {
    const { subscriptions } = await import('@shared/schema');

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));

    return subscription || undefined;
  }


  // Brand Assets implementation
  async createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset> {

    const [brandAsset] = await db.insert(brandAssets).values(asset).returning();
    return brandAsset;
  }

  async getBrandAssetById(id: number): Promise<BrandAsset | undefined> {
    const [asset] = await db.select().from(brandAssets).where(eq(brandAssets.id, id));
    return asset || undefined;
  }

  async getBrandAssetsByType(type: string): Promise<BrandAsset[]> {
    return await db.select().from(brandAssets).where(eq(brandAssets.type, type));
  }

  async getBrandAssetsByCategory(category: string): Promise<BrandAsset[]> {
    return await db.select().from(brandAssets).where(eq(brandAssets.category, category));
  }

  async getAllBrandAssets(): Promise<BrandAsset[]> {
    return await db.select().from(brandAssets).orderBy(brandAssets.order, brandAssets.id);
  }

  async updateBrandAsset(id: number, updates: Partial<BrandAsset>): Promise<BrandAsset | undefined> {
    const [asset] = await db
      .update(brandAssets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brandAssets.id, id))
      .returning();
    return asset || undefined;
  }

  async deleteBrandAsset(id: number): Promise<boolean> {
    const result = await db.delete(brandAssets).where(eq(brandAssets.id, id));
    return true;
  }

  // Brand Configurations implementation
  async createBrandConfiguration(config: InsertBrandConfiguration): Promise<BrandConfiguration> {
    const [configuration] = await db.insert(brandConfigurations).values(config).returning();
    return configuration;
  }

  async getBrandConfigurationById(id: number): Promise<BrandConfiguration | undefined> {
    const [config] = await db.select().from(brandConfigurations).where(eq(brandConfigurations.id, id));
    return config || undefined;
  }

  async getActiveBrandConfiguration(): Promise<BrandConfiguration | undefined> {
    const [config] = await db.select().from(brandConfigurations).where(eq(brandConfigurations.isActive, true));
    return config || undefined;
  }

  async getDefaultBrandConfiguration(): Promise<BrandConfiguration | undefined> {
    const [config] = await db.select().from(brandConfigurations).where(eq(brandConfigurations.isDefault, true));
    return config || undefined;
  }

  async getAllBrandConfigurations(): Promise<BrandConfiguration[]> {
    return await db.select().from(brandConfigurations).orderBy(desc(brandConfigurations.createdAt));
  }

  async updateBrandConfiguration(id: number, updates: Partial<BrandConfiguration>): Promise<BrandConfiguration | undefined> {
    const [config] = await db
      .update(brandConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brandConfigurations.id, id))
      .returning();
    return config || undefined;
  }

  async setActiveBrandConfiguration(id: number): Promise<boolean> {
    // Deactivate all configurations first
    await db.update(brandConfigurations).set({ isActive: false });
    // Activate the selected one
    await db.update(brandConfigurations).set({ isActive: true }).where(eq(brandConfigurations.id, id));
    return true;
  }

  async setDefaultBrandConfiguration(id: number): Promise<boolean> {
    // Remove default from all configurations
    await db.update(brandConfigurations).set({ isDefault: false });
    // Set the selected one as default
    await db.update(brandConfigurations).set({ isDefault: true }).where(eq(brandConfigurations.id, id));
    return true;
  }

  async deleteBrandConfiguration(id: number): Promise<boolean> {
    const result = await db.delete(brandConfigurations).where(eq(brandConfigurations.id, id));
    return true;
  }

  // Brand Application History implementation
  async createBrandApplicationHistory(history: InsertBrandApplicationHistory): Promise<BrandApplicationHistory> {
    const [historyEntry] = await db.insert(brandApplicationHistory).values(history).returning();
    return historyEntry;
  }

  async getBrandApplicationHistory(): Promise<BrandApplicationHistory[]> {
    return await db.select().from(brandApplicationHistory).orderBy(desc(brandApplicationHistory.appliedAt));
  }

  async rollbackBrandConfiguration(historyId: number): Promise<boolean> {
    const [history] = await db
      .update(brandApplicationHistory)
      .set({ status: 'rolled_back', rollbackAt: new Date() })
      .where(eq(brandApplicationHistory.id, historyId))
      .returning();
    return !!history;
  }
}

export const storage = new DatabaseStorage();