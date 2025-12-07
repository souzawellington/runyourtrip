import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertTemplateSchema, insertProjectSchema, generateImageRequestSchema, insertReviewSchema } from "@shared/schema";
import {
  generateWebsiteTemplate,
  createChatCompletion,
  generateImage,
  createEmbedding,
  moderateContent,
  transcribeAudio,
  synthesizeSpeech
} from "./services/openai";
import { openaiImageService } from "./services/openai-image";
import { socialTrendsService } from "./services/social";
import { workspaceService } from "./services/workspace";
import { healthCheckService } from "./services/health-check";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWorkspaceSchema, insertWorkspaceMemberSchema, insertWorkspaceInvitationSchema } from "@shared/schema";
import contentGenerationRoutes from "./routes/content-generation";
import adminRoutes from "./routes/admin";
import managementRoutes from "./routes/management";
import stripeConnectRoutes from "./routes/stripe-connect-routes";
import salesRoutes from "./routes/sales-routes";
import newsletterRoutes from "./routes/newsletter";
import reviewsRoutes from "./routes/reviews";
import recommendationsRoutes from "./routes/recommendations";
import referralsRoutes from "./routes/referrals";
import subscriptionsRoutes from "./routes/subscriptions";
import brandManagementRoutes from "./routes/brand-management";
import { travelTemplateGenerator } from "./tasks/travel-template-generator";
import Stripe from "stripe";
import {
  aiGenerationLimiter,
  templateGenerationLimiter,
  contentGenerationLimiter,
  imageGenerationLimiter,
  generalApiLimiter
} from "./middleware/rate-limit";
import godaddyDNSRoutes from "./routes/godaddy-dns";
import stripeWebhookRoutes from "./routes/stripe-webhook";
import downloadRoutes from "./routes/download";
import express from "express";

// Default category mappings
const CATEGORY_MAP: Record<string, number> = {
  "Portfolio": 15, // Travel Portfolio as default
  "Business": 9, // Travel Blog as default
  "E-commerce": 11, // Booking Platform as default
  "Landing Page": 12, // Travel Guide as default
  "Blog": 9, // Travel Blog
};

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes - with demo user fallback for development
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated via Replit Auth
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }

      // Fallback to demo user for development/testing
      const demoUser = {
        id: "demo-user",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
      };

      // Ensure demo user exists in storage
      await storage.upsertUser(demoUser);
      res.json(demoUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Templates routes
  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string;
      const templates = category
        ? await storage.getTemplatesByCategory(category)
        : await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      res.status(400).json({ message: "Invalid template data", error: (error as Error).message });
    }
  });

  app.patch("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }

      // Create update schema with allowed fields
      const updateTemplateSchema = z.object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        status: z.enum(["draft", "generating", "deployed", "published"]).optional(),
        previewUrl: z.string().url().optional(),
        deploymentUrl: z.string().url().optional(),
        marketplaceUrl: z.string().url().optional(),
        featured: z.boolean().optional(),
        tags: z.array(z.string()).optional()
      });

      // Validate updates
      const validatedUpdates = updateTemplateSchema.parse(req.body);

      const template = await storage.updateTemplate(id, validatedUpdates);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid update data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = "1"; // Demo user ID (string that matches database)
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      console.error("Projects fetch error:", error);
      res.status(500).json({
        message: "Failed to fetch projects",
        error: (error as Error).message
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data", error: (error as Error).message });
    }
  });

  // AI Generation route
  app.post("/api/generate-template", templateGenerationLimiter, async (req, res) => {
    try {
      const { description, category, targetPrice } = req.body;

      if (!description) {
        return res.status(400).json({ message: "Template description is required" });
      }

      // Content moderation check
      try {
        const moderationResult = await moderateContent({ input: description });
        if (moderationResult.results[0]?.flagged) {
          return res.status(400).json({
            message: "Content violates our policies",
            categories: moderationResult.results[0]?.categories
          });
        }
      } catch (moderationError) {
        console.warn("Content moderation failed, proceeding with generation:", moderationError);
      }

      // Generate template using OpenAI
      const generatedTemplate = await generateWebsiteTemplate({
        description,
        category: category || "Portfolio",
        targetPrice: targetPrice || "$49-$99"
      });

      // Create project to track the generation process
      const project = await storage.createProject({
        userId: "1", // Demo user ID (string that matches database)
        templateId: null,
        name: generatedTemplate.name,
        description: generatedTemplate.description,
        aiPrompt: description,
      });

      // Update project with generated code
      await storage.updateProject(project.id, {
        status: "processing",
        workflowStep: 2,
        generatedCode: generatedTemplate.code,
      });

      // Create template from generated content
      const categoryName = category || "Portfolio";
      const template = await storage.createTemplate({
        userId: "1", // Demo user ID (string that matches database)
        categoryId: CATEGORY_MAP[categoryName] || 15, // Default to Portfolio category
        name: generatedTemplate.name,
        description: generatedTemplate.description,
        category: categoryName,
        price: generatedTemplate.estimatedPrice.replace("$", ""),
        code: generatedTemplate.code,
        preview: null,
        tags: generatedTemplate.techStack,
      });

      // Update project with template reference
      await storage.updateProject(project.id, {
        templateId: template.id,
        status: "completed",
        workflowStep: 4,
      });

      res.json({
        project,
        template,
        generated: generatedTemplate
      });
    } catch (error) {
      console.error("Template generation error:", error);
      res.status(500).json({
        message: "Failed to generate template",
        error: (error as Error).message
      });
    }
  });

  // Analytics routes
  app.get("/api/analytics/daily", async (req, res) => {
    try {
      const userId = "1"; // Demo user ID (string that matches database)

      // Fetch real data from database
      const templates = await storage.getAllTemplates();
      const projects = await storage.getProjectsByUserId(userId);

      // Calculate real metrics
      const totalTemplates = templates.length;
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
      const totalRevenue = templates.reduce((sum: number, t: any) => {
        const price = parseFloat(t.price || "0");
        const sales = parseInt(t.sales || "0");
        return sum + (price * sales);
      }, 0);

      const stats = {
        projects: projects.length,
        templates: totalTemplates,
        revenue: `$${totalRevenue.toFixed(2)}`
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily stats" });
    }
  });

  app.get("/api/analytics/weekly-revenue", async (req, res) => {
    try {
      const userId = "1"; // Demo user ID (string that matches database)

      // Fetch real revenue data
      const templates = await storage.getAllTemplates();
      const weeklyRevenue = templates.reduce((sum: number, t: any) => {
        const price = parseFloat(t.price || "0");
        const sales = parseInt(t.sales || "0");
        return sum + (price * sales);
      }, 0);

      res.json({ revenue: `$${weeklyRevenue.toFixed(2)}` });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly revenue" });
    }
  });

  // Dashboard metrics endpoint (optimized with parallel queries and caching)
  const metricsCache = new Map();
  const CACHE_TTL = 30000; // 30 seconds cache

  app.get("/api/analytics/dashboard-metrics", async (req, res) => {
    try {
      const userId = "1"; // Demo user ID (string that matches database)
      const cacheKey = `dashboard-metrics-${userId}`;

      // Check cache first
      const cached = metricsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.set('X-Cache', 'HIT');
        return res.json(cached.data);
      }

      // Fetch all necessary data in parallel
      const [templates, projects] = await Promise.all([
        storage.getAllTemplates(),
        storage.getProjectsByUserId(userId)
      ]);

      // Calculate metrics in parallel using reduce for better performance
      const metrics = templates.reduce((acc: any, t: any) => {
        const sales = parseInt(t.sales || "0");
        const price = parseFloat(t.price || "0");
        acc.totalSales += sales;
        acc.totalRevenue += (price * sales);
        if (sales > 0) acc.templatesWithSales++;
        return acc;
      }, { totalSales: 0, totalRevenue: 0, templatesWithSales: 0 });

      const templatesGenerated = templates.length;
      const successfulDeployments = projects.filter((p: any) =>
        p.status === 'completed' || p.workflowStep >= 3
      ).length;

      const conversionRate = templatesGenerated > 0
        ? ((metrics.templatesWithSales / templatesGenerated) * 100).toFixed(1)
        : "0.0";

      const response = {
        templatesGenerated,
        successfulDeployments,
        totalSales: metrics.totalSales,
        totalRevenue: metrics.totalRevenue.toFixed(2),
        conversionRate: parseFloat(conversionRate)
      };

      // Cache the result
      metricsCache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      res.set('X-Cache', 'MISS');
      res.json(response);
    } catch (error) {
      console.error("Dashboard metrics error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Marketplace routes
  app.get("/api/marketplace/templates", async (req, res) => {
    try {
      const category = req.query.category as string;
      const status = req.query.status as string || "published";

      let templates = await storage.getAllTemplates();

      // Filter by status
      templates = templates.filter((t: any) => t.status === status);

      // Filter by category if provided
      if (category && category !== "all") {
        templates = templates.filter((t: any) => t.category === category);
      }

      // Add marketplace metadata
      templates = templates.map((t: any) => ({
        ...t,
        downloads: t.downloads || Math.floor(Math.random() * 100),
        rating: t.rating || 0, // Use actual rating from database
        featured: t.featured || Math.random() > 0.8,
        isNew: new Date(t.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
      }));

      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketplace templates" });
    }
  });

  // Review routes
  app.get("/api/reviews/:templateId", async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      const reviews = await storage.getReviewsByTemplateId(templateId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const validation = insertReviewSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid review data",
          errors: validation.error.flatten()
        });
      }

      // Check if user has purchased the template
      const hasPurchased = await storage.hasUserPurchasedTemplate(userId, validation.data.templateId);
      if (!hasPurchased) {
        return res.status(403).json({
          message: "You must purchase this template before reviewing it"
        });
      }

      // Check if user has already reviewed this template
      const existingReview = await storage.getReviewByUserAndTemplate(userId, validation.data.templateId);
      if (existingReview) {
        return res.status(400).json({
          message: "You have already reviewed this template"
        });
      }

      const review = await storage.createReview({
        ...validation.data,
        userId
      });

      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get("/api/reviews/check/:templateId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const templateId = parseInt(req.params.templateId);

      const hasPurchased = await storage.hasUserPurchasedTemplate(userId, templateId);
      const existingReview = await storage.getReviewByUserAndTemplate(userId, templateId);

      res.json({
        canReview: hasPurchased && !existingReview,
        hasPurchased,
        hasReviewed: !!existingReview
      });
    } catch (error) {
      console.error("Error checking review status:", error);
      res.status(500).json({ message: "Failed to check review status" });
    }
  });

  app.get("/api/marketplace/trending", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();

      // Mock trending data
      const trending = templates
        .slice(0, 5)
        .map((t: any) => ({
          ...t,
          trend: Math.floor(Math.random() * 50 + 10),
          downloads: Math.floor(Math.random() * 5000 + 1000),
        }))
        .sort((a: any, b: any) => b.trend - a.trend);

      res.json(trending);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending templates" });
    }
  });

  app.post("/api/marketplace/purchase/:id", isAuthenticated, async (req: any, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const template = await storage.getTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Track purchase analytics
      await storage.createAnalyticsEvent({
        userId,
        templateId,
        eventType: "purchase",
        eventData: {
          price: template.price,
          category: template.category,
        },
      });

      // Update revenue metrics
      await storage.createRevenueMetric({
        userId: template.userId,
        templateId,
        date: new Date(),
        revenue: template.price,
        sales: 1,
      });

      res.json({ success: true, template });
    } catch (error) {
      res.status(500).json({ message: "Failed to process purchase" });
    }
  });

  // Advanced Analytics Routes
  app.get("/api/analytics/advanced", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getAdvancedAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching advanced analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/realtime", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getRealTimeMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching real-time metrics:", error);
      res.status(500).json({ message: "Failed to fetch real-time metrics" });
    }
  });

  app.get("/api/analytics/comparison/:period", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { period } = req.params;

      if (!['week', 'month', 'quarter'].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Use 'week', 'month', or 'quarter'" });
      }

      const comparison = await storage.getComparisonMetrics(userId, period as 'week' | 'month' | 'quarter');
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching comparison metrics:", error);
      res.status(500).json({ message: "Failed to fetch comparison metrics" });
    }
  });

  app.get("/api/analytics/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventType, limit = 50 } = req.query;
      const events = await storage.getAnalyticsEventsByUserId(
        userId,
        eventType as string,
        parseInt(limit as string)
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching analytics events:", error);
      res.status(500).json({ message: "Failed to fetch analytics events" });
    }
  });

  app.post("/api/analytics/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = {
        userId,
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const event = await storage.createAnalyticsEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating analytics event:", error);
      res.status(500).json({ message: "Failed to create analytics event" });
    }
  });

  // Replit deployment info
  app.get("/api/deployment/info", async (req, res) => {
    res.json({
      platform: "Replit",
      status: "active",
      url: process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : "http://localhost:5000",
      features: {
        adminDashboard: true,
        contentStudio: true,
        marketplace: true,
        workspaces: true,
        aiGeneration: true
      },
      security: {
        authentication: "JWT + Replit Auth",
        rateLimit: "Enabled",
        cors: "Configured for Replit domains",
        https: "Enforced by Replit"
      }
    });
  });

  // Comprehensive OpenAI API Endpoints

  // Chat Completions
  app.post("/api/v1/chat/completions", aiGenerationLimiter, async (req, res) => {
    try {
      const { messages, maxTokens, temperature } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const result = await createChatCompletion({
        messages,
        maxTokens,
        temperature
      });

      res.json(result);
    } catch (error: any) {
      console.error("Chat completion failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Image Generation
  app.post("/api/v1/images", imageGenerationLimiter, async (req, res) => {
    try {
      const { prompt, size, quality, style } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const result = await generateImage({
        prompt,
        size,
        quality,
        style
      });

      res.json(result);
    } catch (error: any) {
      console.error("Image generation failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Text Embeddings
  app.post("/api/v1/embeddings", async (req, res) => {
    try {
      const { input, model } = req.body;

      if (!input) {
        return res.status(400).json({ error: "Input text is required" });
      }

      const result = await createEmbedding({
        input,
        model
      });

      res.json(result);
    } catch (error: any) {
      console.error("Embedding creation failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Content Moderation
  app.post("/api/v1/moderations", async (req, res) => {
    try {
      const { input } = req.body;

      if (!input) {
        return res.status(400).json({ error: "Input text is required" });
      }

      const result = await moderateContent({ input });

      res.json(result);
    } catch (error: any) {
      console.error("Content moderation failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Audio Transcription
  app.post("/api/v1/audio/transcriptions", async (req, res) => {
    try {
      const audioFile = req.body.audioFile;
      const filename = req.body.filename || "audio.mp3";

      if (!audioFile) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      const buffer = Buffer.from(audioFile, 'base64');

      const result = await transcribeAudio({
        audioFile: buffer,
        filename
      });

      res.json(result);
    } catch (error: any) {
      console.error("Audio transcription failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Text-to-Speech
  app.post("/api/v1/audio/speech", async (req, res) => {
    try {
      const { text, voice } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const response = await synthesizeSpeech(text, voice);

      // Convert ReadableStream to Buffer
      const buffer = Buffer.from(await response.arrayBuffer());

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error: any) {
      console.error("Speech synthesis failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Image Generation Endpoints

  // Generate image with brand context
  app.post("/api/generate-image", isAuthenticated, imageGenerationLimiter, async (req: any, res) => {
    try {
      const validatedRequest = generateImageRequestSchema.parse(req.body);
      const userId = req.user.claims.sub;

      // Get social context if requested
      let socialContext: string | undefined;
      if (validatedRequest.includeSocialContext) {
        socialContext = await socialTrendsService.fetchSocialContext();
      }

      // Generate image with OpenAI
      const result = await openaiImageService.generateImage(validatedRequest, socialContext);

      // Store the generated image
      const storedImage = await storage.createGeneratedImage({
        userId,
        prompt: validatedRequest.prompt,
        imageUrl: result.url,
        size: validatedRequest.size,
        style: validatedRequest.style,
        quality: validatedRequest.quality,
        includeBrandContext: validatedRequest.includeBrandContext,
        includeSocialContext: validatedRequest.includeSocialContext,
        metadata: {
          originalPrompt: validatedRequest.prompt,
          socialContext: socialContext
        }
      });

      res.json({
        success: true,
        image: storedImage
      });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate image"
      });
    }
  });

  // Get generated images
  app.get("/api/generated-images", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const images = await storage.getGeneratedImagesByUserId(userId, limit);
      res.json(images);
    } catch (error: any) {
      console.error("Get images error:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch images"
      });
    }
  });

  // Get trending topics
  app.get("/api/trending-topics", isAuthenticated, async (req, res) => {
    try {
      const topics = await storage.getTrendingTopics();
      res.json(topics);
    } catch (error: any) {
      console.error("Get trending topics error:", error);
      res.status(500).json({
        error: error.message || "Failed to fetch trending topics"
      });
    }
  });

  // Refresh trending topics
  app.post("/api/refresh-trends", isAuthenticated, async (req, res) => {
    try {
      const freshTopics = await socialTrendsService.fetchTrendingTopics();
      await storage.updateTrendingTopics(freshTopics);
      const updatedTopics = await storage.getTrendingTopics();

      res.json({
        success: true,
        topics: updatedTopics
      });
    } catch (error: any) {
      console.error("Refresh trends error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to refresh trends"
      });
    }
  });

  // Health check for AI services
  app.get("/api/ai-health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        openai: !!process.env.OPENAI_API_KEY,
        social: !!process.env.SOCIAL_API_ENDPOINT
      }
    });
  });

  // Workspace management routes
  app.post("/api/workspaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceData = insertWorkspaceSchema.parse(req.body);
      const workspace = await workspaceService.createWorkspace(userId, workspaceData);
      res.status(201).json(workspace);
    } catch (error) {
      console.error("Error creating workspace:", error);
      res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  app.get("/api/workspaces", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaces = await workspaceService.getUserWorkspaces(userId);
      res.json(workspaces);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  app.get("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);
      const workspaceData = await workspaceService.getWorkspaceWithMembers(workspaceId, userId);

      if (!workspaceData) {
        return res.status(404).json({ message: "Workspace not found or access denied" });
      }

      res.json(workspaceData);
    } catch (error) {
      console.error("Error fetching workspace:", error);
      res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  app.patch("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);

      // Check if user has admin permission
      const hasPermission = await workspaceService.checkUserAccess(userId, workspaceId, "admin");
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const workspace = await storage.updateWorkspace(workspaceId, req.body);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      await workspaceService.logActivity(workspaceId, userId, "workspace_updated", "workspace", workspaceId.toString(), req.body, req);
      res.json(workspace);
    } catch (error) {
      console.error("Error updating workspace:", error);
      res.status(500).json({ message: "Failed to update workspace" });
    }
  });

  app.delete("/api/workspaces/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);

      // Only workspace owner can delete
      const userRole = await storage.getUserWorkspaceRole(userId, workspaceId);
      if (userRole !== "owner") {
        return res.status(403).json({ message: "Only workspace owner can delete workspace" });
      }

      const success = await storage.deleteWorkspace(workspaceId);
      if (!success) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting workspace:", error);
      res.status(500).json({ message: "Failed to delete workspace" });
    }
  });

  // Workspace member management
  app.post("/api/workspaces/:id/invite", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);
      const { email, role } = req.body;

      const invitation = await workspaceService.inviteUserToWorkspace(workspaceId, userId, email, role);
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error inviting user:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to invite user" });
    }
  });

  app.post("/api/workspaces/accept-invitation/:token", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const token = req.params.token;

      const member = await workspaceService.acceptInvitation(token, userId);
      res.json(member);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to accept invitation" });
    }
  });

  app.get("/api/workspaces/:id/members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);

      // Check if user has access to this workspace
      const hasAccess = await workspaceService.checkUserAccess(userId, workspaceId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const members = await storage.getWorkspaceMembers(workspaceId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.delete("/api/workspaces/:id/members/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);
      const targetUserId = req.params.userId;

      const success = await workspaceService.removeUserFromWorkspace(workspaceId, targetUserId, currentUserId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to remove member" });
    }
  });

  app.patch("/api/workspaces/:id/members/:userId/role", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);
      const targetUserId = req.params.userId;
      const { role } = req.body;

      const member = await workspaceService.updateMemberRole(workspaceId, targetUserId, role, currentUserId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json(member);
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update member role" });
    }
  });

  app.get("/api/workspaces/:id/activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workspaceId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 50;

      // Check if user has access to this workspace
      const hasAccess = await workspaceService.checkUserAccess(userId, workspaceId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const activity = await workspaceService.getWorkspaceActivity(workspaceId, limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Content Generation Routes
  app.use("/api/content", contentGenerationLimiter, contentGenerationRoutes);

  // Admin routes
  app.use("/api/admin", adminRoutes);

  // Management routes (protected with admin auth)
  app.use("/api/management", managementRoutes);

  // Stripe Connect routes
  app.use("/api/stripe-connect", stripeConnectRoutes);
  app.use("/api/sales", salesRoutes);
  app.use("/api/godaddy", godaddyDNSRoutes);

  // Stripe Webhook route (IMPORTANT: must use raw body parser, not JSON)
  // This must be registered before express.json() middleware for this specific path
  app.use("/api/stripe", express.raw({ type: 'application/json' }), stripeWebhookRoutes);

  // Download routes (secure template downloads)
  app.use("/api/download", downloadRoutes);


  // Template routes
  // OpenAI API Routes
  app.use("/api/newsletter", newsletterRoutes);

  // Reviews routes
  app.use("/api/reviews", reviewsRoutes);

  // Recommendations routes
  app.use("/api/recommendations", recommendationsRoutes);

  // Referrals routes
  app.use("/api/referrals", referralsRoutes);

  // Subscriptions routes
  app.use("/api/subscriptions", subscriptionsRoutes);

  // Brand management routes
  brandManagementRoutes(app);

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, templateId, templateName } = req.body;

      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          templateId: templateId || '',
          templateName: templateName || '',
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({
        message: "Error creating payment intent: " + error.message
      });
    }
  });

  app.post("/api/create-subscription", async (req, res) => {
    try {
      const { planId, planName, amount } = req.body;

      if (!planId || !amount) {
        return res.status(400).json({ message: "Plan ID and amount are required" });
      }

      // Create subscription with basic setup
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        setup_future_usage: 'off_session',
        metadata: {
          planId,
          planName,
          subscriptionType: 'recurring',
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(500).json({
        message: "Error creating subscription: " + error.message
      });
    }
  });

  // Travel template generation task route
  app.post("/api/tasks/generate-travel-templates", async (req, res) => {
    try {
      await travelTemplateGenerator.generateAllTravelTemplates();
      res.json({ success: true, message: "Travel templates generated successfully" });
    } catch (error: any) {
      console.error("Travel template generation failed:", error);
      res.status(500).json({
        message: "Failed to generate travel templates: " + error.message
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const report = await healthCheckService.generateHealthReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating health report:", error);
      res.status(500).json({
        error: "Failed to generate health report",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Simple health check endpoint for monitoring
  app.get("/api/health/ping", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
  });

  // Comprehensive health report
  app.get('/api/health/report', async (req, res) => {
    try {
      const { HealthReportService } = await import('./services/health-report');
      const report = await HealthReportService.generateComprehensiveReport();
      res.json(report);
    } catch (error) {
      console.error('Health report generation failed:', error);
      res.status(500).json({
        error: 'Failed to generate health report',
        message: (error as Error).message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}