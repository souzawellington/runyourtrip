import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, varchar, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Stripe Connect fields
  stripeAccountId: varchar("stripe_account_id").unique(),
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeAccountStatus: varchar("stripe_account_status"), // 'pending', 'active', 'restricted', 'disabled'
  stripeOnboardingCompleted: boolean("stripe_onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"), // Icon name for UI
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Keep for backwards compatibility
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  code: text("code").notNull(),
  preview: text("preview"),
  previewUrl: text("preview_url"), // Live demo URL
  imageThumbnailUrl: text("image_thumbnail_url"), // Thumbnail for cards
  gridViewImageUrl: text("grid_view_image_url"), // Larger image for grid view
  status: text("status").notNull().default("draft"), // draft, generating, deployed, published
  deploymentUrl: text("deployment_url"),
  marketplaceUrl: text("marketplace_url"),
  sales: integer("sales").default(0).notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  trendingScore: integer("trending_score").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  tags: text("tags").array().default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_templates_category_id").on(table.categoryId),
  index("idx_templates_price").on(table.price),
  index("idx_templates_trending_score").on(table.trendingScore),
  index("idx_templates_status").on(table.status),
  index("idx_templates_user_id").on(table.userId),
]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: integer("template_id"),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  workflowStep: integer("workflow_step").default(1).notNull(), // 1: generation, 2: github, 3: deployment, 4: marketplace
  githubUrl: text("github_url"),
  deploymentUrl: text("deployment_url"),
  marketplaceUrl: text("marketplace_url"),
  aiPrompt: text("ai_prompt").notNull(),
  generatedCode: text("generated_code"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: integer("template_id"),
  date: timestamp("date").defaultNow().notNull(),
  views: integer("views").default(0).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0").notNull(),
});

// AI Image Generation tables
export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  size: text("size").notNull(),
  style: text("style").notNull(),
  quality: text("quality").notNull(),
  includeBrandContext: boolean("include_brand_context").default(true),
  includeSocialContext: boolean("include_social_context").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export const trendingTopics = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  engagement: text("engagement").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Analytics Tables
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: integer("template_id"),
  eventType: text("event_type").notNull(), // 'view', 'download', 'purchase', 'share', 'generate'
  eventData: jsonb("event_data"), // Additional event metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const revenueMetrics = pgTable("revenue_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: integer("template_id"),
  date: timestamp("date").notNull(),
  revenue: text("revenue").notNull().default("0"),
  sales: integer("sales").notNull().default(0),
  views: integer("views").notNull().default(0),
  downloads: integer("downloads").notNull().default(0),
  conversionRate: text("conversion_rate").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  pageViews: integer("page_views").default(0),
  actions: integer("actions").default(0),
  deviceType: text("device_type"),
  browser: text("browser"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchases table for marketplace transactions
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: integer("template_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  transactionId: text("transaction_id").unique(),
  paymentMethod: text("payment_method"), // stripe, paypal, etc
  status: text("status").notNull().default("completed"), // pending, completed, refunded
  purchaseDate: timestamp("purchase_date").defaultNow(),
  metadata: jsonb("metadata"), // Additional transaction details
}, (table) => [
  index("idx_purchases_user_id").on(table.userId),
  index("idx_purchases_template_id").on(table.templateId),
  index("idx_purchases_seller_id").on(table.sellerId),
  unique("unique_user_template_purchase").on(table.userId, table.templateId),
]);

// Reviews table for template ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name"),
  templateId: integer("template_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  comment: text("comment"),
  helpful: integer("helpful").default(0),
  verified: boolean("verified").default(false), // Verified purchase
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_reviews_template_id").on(table.templateId),
  index("idx_reviews_user_id").on(table.userId),
  index("idx_reviews_rating").on(table.rating),
  unique("unique_user_template_review").on(table.userId, table.templateId),
]);

// Multi-user workspace management tables
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 50 }).default("active"), // active, archived, suspended
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_workspaces_owner_id").on(table.ownerId),
]);

export const workspaceMembers = pgTable("workspace_members", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // owner, admin, editor, viewer
  permissions: jsonb("permissions").default({}),
  invitedBy: varchar("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  status: varchar("status", { length: 50 }).default("active"), // active, pending, suspended
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_workspace_members_workspace_id").on(table.workspaceId),
  index("idx_workspace_members_user_id").on(table.userId),
  unique("unique_workspace_user").on(table.workspaceId, table.userId),
]);

export const workspaceInvitations = pgTable("workspace_invitations", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  invitedBy: varchar("invited_by").references(() => users.id).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, accepted, expired, cancelled
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_workspace_invitations_workspace_id").on(table.workspaceId),
  index("idx_workspace_invitations_email").on(table.email),
  index("idx_workspace_invitations_token").on(table.token),
]);

export const workspaceActivity = pgTable("workspace_activity", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id").references(() => workspaces.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50}),
  resourceId: varchar("resource_id"),
  details: jsonb("details").default({}),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_workspace_activity_workspace_id").on(table.workspaceId),
  index("idx_workspace_activity_user_id").on(table.userId),
]);

// User Preferences for Recommendations
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  preferredCategories: text("preferred_categories").array().default([]),
  priceRange: jsonb("price_range").default({ min: 0, max: 500 }),
  viewHistory: jsonb("view_history").default([]), // Array of viewed template IDs with timestamps
  purchaseHistory: jsonb("purchase_history").default([]), // Array of purchased template IDs
  searchHistory: text("search_history").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_preferences_user_id").on(table.userId),
]);

// Referral Program
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").notNull(),
  referredUserId: varchar("referred_user_id"),
  referralCode: varchar("referral_code", { length: 20 }).notNull().unique(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, expired
  reward: decimal("reward", { precision: 10, scale: 2 }).default("0"),
  rewardType: varchar("reward_type", { length: 20 }).default("credit"), // credit, discount, commission
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_referrals_referrer_id").on(table.referrerId),
  index("idx_referrals_referred_user_id").on(table.referredUserId),
  index("idx_referrals_code").on(table.referralCode),
  index("idx_referrals_status").on(table.status),
]);

// Subscription Tiers
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tierId: integer("tier_id").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // active, cancelled, expired, trial
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(true),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  paymentMethod: varchar("payment_method", { length: 50 }),
  lastPaymentDate: timestamp("last_payment_date"),
  nextBillingDate: timestamp("next_billing_date"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_subscriptions_user_id").on(table.userId),
  index("idx_subscriptions_tier_id").on(table.tierId),
  index("idx_subscriptions_status").on(table.status),
  unique("unique_user_active_subscription").on(table.userId, table.status),
]);

export const subscriptionTiers = pgTable("subscription_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  interval: varchar("interval", { length: 20 }).default("monthly"), // monthly, yearly
  features: jsonb("features").default([]), // Array of feature strings
  limits: jsonb("limits").default({}), // Object with various limits
  benefits: text("benefits").array().default([]),
  stripePriceId: varchar("stripe_price_id"),
  stripeProductId: varchar("stripe_product_id"),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  highlighted: boolean("highlighted").default(false), // For "Most Popular" badges
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand Assets table for managing brand elements
export const brandAssets = pgTable("brand_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'logo', 'color', 'font', 'image', 'document'
  category: text("category").notNull(), // 'primary', 'secondary', 'accent', 'supporting'
  value: text("value").notNull(), // hex for colors, path for files, font name for fonts
  metadata: jsonb("metadata"), // Additional properties like RGB, CMYK for colors
  filePath: text("file_path"),
  mimeType: text("mime_type"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Brand Configurations table for different brand versions
export const brandConfigurations = pgTable("brand_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  config: jsonb("config").notNull(), // Full brand configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Brand Application History table for tracking changes
export const brandApplicationHistory = pgTable("brand_application_history", {
  id: serial("id").primaryKey(),
  configurationId: integer("configuration_id").notNull().references(() => brandConfigurations.id),
  appliedBy: varchar("applied_by").notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  rollbackAt: timestamp("rollback_at"),
  status: text("status").notNull().default("active"), // 'active', 'rolled_back'
  changes: jsonb("changes").notNull(), // Details of what was changed
});

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  icon: true,
  displayOrder: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  userId: true,
  categoryId: true,
  name: true,
  description: true,
  category: true,
  price: true,
  code: true,
  preview: true,
  previewUrl: true,
  imageThumbnailUrl: true,
  gridViewImageUrl: true,
  tags: true,
  trendingScore: true,
  featured: true,
  status: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  templateId: true,
  name: true,
  description: true,
  aiPrompt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  userId: true,
  templateId: true,
  views: true,
  downloads: true,
  revenue: true,
});

// AI Image Generation schemas
export const insertGeneratedImageSchema = createInsertSchema(generatedImages).pick({
  userId: true,
  prompt: true,
  imageUrl: true,
  size: true,
  style: true,
  quality: true,
  includeBrandContext: true,
  includeSocialContext: true,
  metadata: true,
});

export const insertTrendingTopicSchema = createInsertSchema(trendingTopics).pick({
  title: true,
  engagement: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).pick({
  userId: true,
  templateId: true,
  eventType: true,
  eventData: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
});

export const insertRevenueMetricSchema = createInsertSchema(revenueMetrics).pick({
  userId: true,
  templateId: true,
  date: true,
  revenue: true,
  sales: true,
  views: true,
  downloads: true,
  conversionRate: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).pick({
  userId: true,
  sessionId: true,
  startTime: true,
  endTime: true,
  duration: true,
  pageViews: true,
  actions: true,
  deviceType: true,
  browser: true,
  country: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).pick({
  userId: true,
  templateId: true,
  sellerId: true,
  purchasePrice: true,
  transactionId: true,
  paymentMethod: true,
  status: true,
  metadata: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  userName: true,
  templateId: true,
  rating: true,
  title: true,
  comment: true,
}).extend({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

// Workspace schemas
export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  description: true,
  ownerId: true,
  status: true,
  settings: true,
});

export const insertWorkspaceMemberSchema = createInsertSchema(workspaceMembers).pick({
  workspaceId: true,
  userId: true,
  role: true,
  permissions: true,
  invitedBy: true,
  joinedAt: true,
  status: true,
});

export const insertWorkspaceInvitationSchema = createInsertSchema(workspaceInvitations).pick({
  workspaceId: true,
  email: true,
  role: true,
  invitedBy: true,
  token: true,
  expiresAt: true,
});

export const insertWorkspaceActivitySchema = createInsertSchema(workspaceActivity).pick({
  workspaceId: true,
  userId: true,
  action: true,
  resourceType: true,
  resourceId: true,
  details: true,
  ipAddress: true,
  userAgent: true,
});

export const generateImageRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
  style: z.enum(["professional", "vibrant", "minimal", "luxury"]).default("professional"),
  quality: z.enum(["standard", "hd"]).default("standard"),
  includeBrandContext: z.boolean().default(true),
  includeSocialContext: z.boolean().default(true),
});

// User Preferences & Recommendation schemas
export const insertUserPreferenceSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  preferredCategories: true,
  priceRange: true,
  viewHistory: true,
  purchaseHistory: true,
  searchHistory: true,
});

// Referral schemas  
export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerId: true,
  referredUserId: true,
  referralCode: true,
  status: true,
  reward: true,
  rewardType: true,
  expiresAt: true,
  metadata: true,
});

// Subscription schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  tierId: true,
  status: true,
  startDate: true,
  endDate: true,
  autoRenew: true,
  stripeSubscriptionId: true,
  stripeCustomerId: true,
  paymentMethod: true,
  nextBillingDate: true,
  metadata: true,
});

export const insertSubscriptionTierSchema = createInsertSchema(subscriptionTiers).pick({
  name: true,
  slug: true,
  price: true,
  interval: true,
  features: true,
  limits: true,
  benefits: true,
  stripePriceId: true,
  stripeProductId: true,
  isActive: true,
  displayOrder: true,
  highlighted: true,
});

// Brand Asset schemas
export const insertBrandAssetSchema = createInsertSchema(brandAssets).pick({
  name: true,
  type: true,
  category: true,
  value: true,
  metadata: true,
  filePath: true,
  mimeType: true,
  isActive: true,
  order: true,
});

export const insertBrandConfigurationSchema = createInsertSchema(brandConfigurations).pick({
  name: true,
  description: true,
  isActive: true,
  isDefault: true,
  config: true,
});

export const insertBrandApplicationHistorySchema = createInsertSchema(brandApplicationHistory).pick({
  configurationId: true,
  appliedBy: true,
  status: true,
  changes: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

// AI Image Generation types
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type InsertTrendingTopic = z.infer<typeof insertTrendingTopicSchema>;
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>;

// Advanced Analytics types
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type RevenueMetric = typeof revenueMetrics.$inferSelect;
export type InsertRevenueMetric = z.infer<typeof insertRevenueMetricSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

// Marketplace types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Workspace types
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = z.infer<typeof insertWorkspaceMemberSchema>;
export type WorkspaceInvitation = typeof workspaceInvitations.$inferSelect;
export type InsertWorkspaceInvitation = z.infer<typeof insertWorkspaceInvitationSchema>;
export type WorkspaceActivity = typeof workspaceActivity.$inferSelect;
export type InsertWorkspaceActivity = z.infer<typeof insertWorkspaceActivitySchema>;

// Recommendation & Subscription types
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = z.infer<typeof insertSubscriptionTierSchema>;

// Brand Asset types
export type BrandAsset = typeof brandAssets.$inferSelect;
export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;
export type BrandConfiguration = typeof brandConfigurations.$inferSelect;
export type InsertBrandConfiguration = z.infer<typeof insertBrandConfigurationSchema>;
export type BrandApplicationHistory = typeof brandApplicationHistory.$inferSelect;
export type InsertBrandApplicationHistory = z.infer<typeof insertBrandApplicationHistorySchema>;
