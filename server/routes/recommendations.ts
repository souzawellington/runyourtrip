import { Router } from "express";
import { db } from "../db";
import { templates, userPreferences, purchases, reviews, categories } from "@shared/schema";
import { eq, sql, desc, and, inArray, ne } from "drizzle-orm";
import { logger } from "../utils/centralized-logger";

const router = Router();

// Get personalized recommendations for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 12;

    // Get user preferences
    let preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    // Create preferences if not exists
    if (preferences.length === 0) {
      await db.insert(userPreferences).values({
        userId,
        preferredCategories: [],
        priceRange: { min: 0, max: 500 },
        viewHistory: [],
        purchaseHistory: [],
        searchHistory: [],
      });
      preferences = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .limit(1);
    }

    const userPref = preferences[0];

    // Get templates based on multiple factors
    let recommendedTemplates = [];

    // 1. Templates from preferred categories
    if (userPref.preferredCategories && userPref.preferredCategories.length > 0) {
      const categoryTemplates = await db
        .select()
        .from(templates)
        .where(
          and(
            inArray(templates.category, userPref.preferredCategories),
            eq(templates.status, "published")
          )
        )
        .orderBy(desc(templates.rating), desc(templates.trendingScore))
        .limit(Math.floor(limit / 2));
      
      recommendedTemplates.push(...categoryTemplates);
    }

    // 2. Templates similar to purchases (collaborative filtering)
    const purchaseHistory = userPref.purchaseHistory as any[] || [];
    if (purchaseHistory.length > 0) {
      // Get categories of purchased templates
      const purchasedTemplates = await db
        .select()
        .from(templates)
        .where(inArray(templates.id, purchaseHistory.map((p: any) => p.templateId)))
        .limit(5);

      const purchasedCategories = Array.from(new Set(purchasedTemplates.map(t => t.category)));
      
      if (purchasedCategories.length > 0) {
        const similarTemplates = await db
          .select()
          .from(templates)
          .where(
            and(
              inArray(templates.category, purchasedCategories),
              ne(templates.id, sql`ANY(${purchaseHistory.map((p: any) => p.templateId)})`),
              eq(templates.status, "published")
            )
          )
          .orderBy(desc(templates.rating))
          .limit(Math.floor(limit / 3));
        
        recommendedTemplates.push(...similarTemplates);
      }
    }

    // 3. Trending templates in user's price range
    const priceRange = userPref.priceRange as any || { min: 0, max: 500 };
    const trendingTemplates = await db
      .select()
      .from(templates)
      .where(
        and(
          sql`${templates.price}::numeric >= ${priceRange.min}`,
          sql`${templates.price}::numeric <= ${priceRange.max}`,
          eq(templates.status, "published")
        )
      )
      .orderBy(desc(templates.trendingScore), desc(templates.views))
      .limit(Math.floor(limit / 3));
    
    recommendedTemplates.push(...trendingTemplates);

    // 4. If not enough recommendations, add top-rated templates
    if (recommendedTemplates.length < limit) {
      const topRatedTemplates = await db
        .select()
        .from(templates)
        .where(eq(templates.status, "published"))
        .orderBy(desc(templates.rating), desc(templates.downloads))
        .limit(limit - recommendedTemplates.length);
      
      recommendedTemplates.push(...topRatedTemplates);
    }

    // Remove duplicates
    const uniqueTemplates = Array.from(
      new Map(recommendedTemplates.map(t => [t.id, t])).values()
    ).slice(0, limit);

    res.json({
      recommendations: uniqueTemplates,
      basedOn: {
        categories: userPref.preferredCategories || [],
        priceRange,
        hasHistory: purchaseHistory.length > 0,
      },
    });
  } catch (error) {
    logger.error("Failed to get recommendations", { error, userId: req.params.userId });
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

// Update user preferences based on actions
router.post("/preferences/update", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.body.userId;
    const { action, data } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get existing preferences
    const [existingPref] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    let updates: any = {};

    switch (action) {
      case "view":
        const viewHistory = (existingPref?.viewHistory as any[] || []);
        viewHistory.push({
          templateId: data.templateId,
          timestamp: new Date().toISOString(),
        });
        // Keep only last 50 views
        updates.viewHistory = viewHistory.slice(-50);
        break;

      case "search":
        const searchHistory = existingPref?.searchHistory || [];
        if (!searchHistory.includes(data.query)) {
          searchHistory.push(data.query);
        }
        updates.searchHistory = searchHistory.slice(-20);
        break;

      case "purchase":
        const purchaseHistory = (existingPref?.purchaseHistory as any[] || []);
        purchaseHistory.push({
          templateId: data.templateId,
          timestamp: new Date().toISOString(),
        });
        updates.purchaseHistory = purchaseHistory;

        // Also update preferred categories based on purchase
        const [template] = await db
          .select()
          .from(templates)
          .where(eq(templates.id, data.templateId));
        
        if (template) {
          const preferredCategories = existingPref?.preferredCategories || [];
          if (!preferredCategories.includes(template.category)) {
            preferredCategories.push(template.category);
            updates.preferredCategories = preferredCategories;
          }
        }
        break;

      case "setPriceRange":
        updates.priceRange = data.priceRange;
        break;

      case "setCategories":
        updates.preferredCategories = data.categories;
        break;
    }

    updates.updatedAt = new Date();

    if (existingPref) {
      await db
        .update(userPreferences)
        .set(updates)
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({
        userId,
        ...updates,
      });
    }

    res.json({ success: true, message: "Preferences updated" });
  } catch (error) {
    logger.error("Failed to update preferences", { error });
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Get similar templates
router.get("/similar/:templateId", async (req, res) => {
  try {
    const templateId = parseInt(req.params.templateId);
    const limit = parseInt(req.query.limit as string) || 6;

    // Get the template
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId));

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Find similar templates based on category and price range
    const priceMin = parseFloat(template.price) * 0.7;
    const priceMax = parseFloat(template.price) * 1.3;

    const similarTemplates = await db
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.category, template.category),
          ne(templates.id, templateId),
          sql`${templates.price}::numeric >= ${priceMin}`,
          sql`${templates.price}::numeric <= ${priceMax}`,
          eq(templates.status, "published")
        )
      )
      .orderBy(desc(templates.rating), desc(templates.trendingScore))
      .limit(limit);

    res.json(similarTemplates);
  } catch (error) {
    logger.error("Failed to get similar templates", { error });
    res.status(500).json({ error: "Failed to get similar templates" });
  }
});

export default router;