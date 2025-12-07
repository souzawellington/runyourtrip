import { Router } from "express";
import { z } from "zod";
import { insertReviewSchema, reviews, templates, purchases } from "@shared/schema";
import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { logger } from "../utils/centralized-logger";

const router = Router();

// Get reviews for a template
router.get("/template/:templateId", async (req, res) => {
  try {
    const templateId = parseInt(req.params.templateId);
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = req.query.sortBy || "newest"; // newest, helpful, rating

    // Build query with sorting
    const orderByClause = sortBy === "helpful" 
      ? desc(reviews.helpful)
      : sortBy === "rating"
      ? desc(reviews.rating)
      : desc(reviews.createdAt);

    const templateReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.templateId, templateId))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reviews)
      .where(eq(reviews.templateId, templateId));

    // Calculate rating distribution
    const ratingDistribution = await db
      .select({
        rating: reviews.rating,
        count: sql<number>`count(*)::int`
      })
      .from(reviews)
      .where(eq(reviews.templateId, templateId))
      .groupBy(reviews.rating);

    res.json({
      reviews: templateReviews,
      total: count,
      ratingDistribution: ratingDistribution.reduce((acc, { rating, count }) => {
        acc[rating] = count;
        return acc;
      }, {} as Record<number, number>),
      hasMore: offset + limit < count,
    });
  } catch (error) {
    logger.error("Failed to fetch reviews", { error, templateId: req.params.templateId });
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Submit a review
router.post("/", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.body.userId;
    const userName = req.user?.claims?.name || req.body.userName || "Anonymous";
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const reviewData = {
      ...req.body,
      userId,
      userName,
    };

    // Validate input
    const validatedData = insertReviewSchema.parse(reviewData);

    // Check if user has purchased the template
    const purchase = await db
      .select()
      .from(purchases)
      .where(
        and(
          eq(purchases.userId, userId),
          eq(purchases.templateId, validatedData.templateId)
        )
      )
      .limit(1);

    const isVerified = purchase.length > 0;

    // Check for existing review
    const existingReview = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.templateId, validatedData.templateId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      // Update existing review
      const [updatedReview] = await db
        .update(reviews)
        .set({
          ...validatedData,
          verified: isVerified,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existingReview[0].id))
        .returning();

      // Update template average rating
      await updateTemplateRating(validatedData.templateId);

      return res.json({
        success: true,
        review: updatedReview,
        message: "Review updated successfully",
      });
    }

    // Create new review
    const [newReview] = await db
      .insert(reviews)
      .values({
        ...validatedData,
        verified: isVerified,
      })
      .returning();

    // Update template average rating
    await updateTemplateRating(validatedData.templateId);

    logger.info("Review submitted", {
      userId,
      templateId: validatedData.templateId,
      rating: validatedData.rating,
    });

    res.status(201).json({
      success: true,
      review: newReview,
      message: "Review submitted successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid review data",
        details: error.errors 
      });
    }
    
    logger.error("Failed to submit review", { error });
    res.status(500).json({ 
      error: "Failed to submit review. Please try again." 
    });
  }
});

// Mark review as helpful
router.post("/:reviewId/helpful", async (req: any, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Increment helpful count
    const [updatedReview] = await db
      .update(reviews)
      .set({
        helpful: sql`${reviews.helpful} + 1`,
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({
      success: true,
      helpful: updatedReview.helpful,
    });
  } catch (error) {
    logger.error("Failed to mark review as helpful", { error });
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Get user's reviews
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const userReviews = await db
      .select({
        review: reviews,
        templateName: templates.name,
        templateId: templates.id,
      })
      .from(reviews)
      .leftJoin(templates, eq(reviews.templateId, templates.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    res.json(userReviews);
  } catch (error) {
    logger.error("Failed to fetch user reviews", { error });
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Helper function to update template average rating
async function updateTemplateRating(templateId: number) {
  try {
    const [avgRating] = await db
      .select({
        avg: sql<string>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.templateId, templateId));

    if (avgRating.avg) {
      await db
        .update(templates)
        .set({
          rating: avgRating.avg,
        })
        .where(eq(templates.id, templateId));
    }
  } catch (error) {
    logger.error("Failed to update template rating", { error, templateId });
  }
}

export default router;