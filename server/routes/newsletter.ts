import { Router } from "express";
import { z } from "zod";
import { insertNewsletterSubscriberSchema, newsletterSubscribers } from "@shared/newsletter-schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { logger } from "../utils/centralized-logger";

const router = Router();

// Generate discount code
function generateDiscountCode(): string {
  const prefix = "RYT";
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}30OFF${randomNum}`;
}

// Subscribe to newsletter
router.post("/subscribe", async (req, res) => {
  try {
    const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
    
    // Check if email already exists
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, validatedData.email))
      .limit(1);
    
    if (existing.length > 0) {
      // Update subscription status if already exists
      if (!existing[0].subscribed) {
        await db
          .update(newsletterSubscribers)
          .set({ 
            subscribed: true,
            unsubscribedAt: null 
          })
          .where(eq(newsletterSubscribers.email, validatedData.email));
      }
      
      return res.json({ 
        success: true, 
        message: "Already subscribed",
        discountCode: existing[0].discountCode 
      });
    }
    
    // Generate unique discount code
    const discountCode = generateDiscountCode();
    
    // Insert new subscriber
    const [subscriber] = await db
      .insert(newsletterSubscribers)
      .values({
        ...validatedData,
        discountCode,
        source: req.body.source || "website",
      })
      .returning();
    
    logger.info("New newsletter subscription", {
      email: validatedData.email,
      source: req.body.source || "website",
    });
    
    // TODO: Send welcome email with discount code
    // This would integrate with SendGrid or another email service
    
    res.json({ 
      success: true, 
      message: "Successfully subscribed",
      discountCode 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid email format",
        details: error.errors 
      });
    }
    
    logger.error("Newsletter subscription error", { error });
    res.status(500).json({ 
      error: "Failed to subscribe. Please try again." 
    });
  }
});

// Unsubscribe from newsletter
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const result = await db
      .update(newsletterSubscribers)
      .set({ 
        subscribed: false,
        unsubscribedAt: new Date() 
      })
      .where(eq(newsletterSubscribers.email, email))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }
    
    logger.info("Newsletter unsubscription", { email });
    
    res.json({ 
      success: true, 
      message: "Successfully unsubscribed" 
    });
  } catch (error) {
    logger.error("Newsletter unsubscription error", { error });
    res.status(500).json({ 
      error: "Failed to unsubscribe. Please try again." 
    });
  }
});

// Get subscriber status (for admin)
router.get("/subscribers", async (req, res) => {
  try {
    // Check if user is admin (implement your auth check here)
    // For now, we'll just return a count
    
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.subscribed, true));
    
    res.json({
      total: subscribers.length,
      // Only return limited info for privacy
      recentCount: subscribers.filter(s => {
        const date = new Date(s.subscribedAt);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return date > dayAgo;
      }).length,
    });
  } catch (error) {
    logger.error("Failed to get subscribers", { error });
    res.status(500).json({ 
      error: "Failed to get subscriber data" 
    });
  }
});

export default router;