import { Router } from "express";
import { db } from "../db";
import { subscriptions, subscriptionTiers, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../utils/centralized-logger";
import Stripe from "stripe";

const router = Router();

// Initialize Stripe if available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-07-30.basil" })
  : null;

// Get all subscription tiers
router.get("/tiers", async (req, res) => {
  try {
    const tiers = await db
      .select()
      .from(subscriptionTiers)
      .where(eq(subscriptionTiers.isActive, true))
      .orderBy(subscriptionTiers.displayOrder);

    res.json(tiers);
  } catch (error) {
    logger.error("Failed to fetch subscription tiers", { error });
    res.status(500).json({ error: "Failed to fetch subscription tiers" });
  }
});

// Get user's current subscription
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [subscription] = await db
      .select({
        subscription: subscriptions,
        tier: subscriptionTiers,
      })
      .from(subscriptions)
      .leftJoin(subscriptionTiers, eq(subscriptions.tierId, subscriptionTiers.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (!subscription) {
      // Return free tier as default
      const [freeTier] = await db
        .select()
        .from(subscriptionTiers)
        .where(eq(subscriptionTiers.slug, "free"))
        .limit(1);

      return res.json({
        subscription: null,
        tier: freeTier,
        status: "free",
      });
    }

    res.json({
      subscription: subscription.subscription,
      tier: subscription.tier,
      status: subscription.subscription.status,
    });
  } catch (error) {
    logger.error("Failed to fetch user subscription", { error });
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// Create or update subscription
router.post("/subscribe", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.body.userId;
    const { tierId, paymentMethodId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get the tier
    const [tier] = await db
      .select()
      .from(subscriptionTiers)
      .where(eq(subscriptionTiers.id, tierId))
      .limit(1);

    if (!tier) {
      return res.status(404).json({ error: "Subscription tier not found" });
    }

    // Check for existing active subscription
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (existingSub) {
      // Cancel existing subscription
      await db
        .update(subscriptions)
        .set({
          status: "cancelled",
          endDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSub.id));
    }

    let stripeSubscriptionId = null;
    let stripeCustomerId = null;

    // Create Stripe subscription if available and not free tier
    if (stripe && tier.stripePriceId && parseFloat(tier.price) > 0) {
      try {
        // Get or create Stripe customer
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        let customer;
        if (user?.stripeCustomerId) {
          customer = await stripe.customers.retrieve(user.stripeCustomerId as string);
        } else {
          customer = await stripe.customers.create({
            email: user?.email || undefined,
            metadata: { userId },
          });
          
          // Save customer ID to user
          await db
            .update(users)
            .set({ stripeCustomerId: customer.id })
            .where(eq(users.id, userId));
        }

        stripeCustomerId = customer.id;

        // Attach payment method if provided
        if (paymentMethodId) {
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
          });
          
          // Set as default payment method
          await stripe.customers.update(customer.id, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
        }

        // Create subscription
        const stripeSubscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: tier.stripePriceId }],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        });

        stripeSubscriptionId = stripeSubscription.id;
      } catch (stripeError) {
        logger.error("Stripe subscription creation failed", { stripeError });
        // Continue without Stripe integration
      }
    }

    // Calculate billing dates
    const startDate = new Date();
    const nextBillingDate = new Date();
    
    if (tier.interval === "monthly") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (tier.interval === "yearly") {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Create subscription in database
    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        tierId: tier.id,
        status: "active",
        startDate,
        nextBillingDate: parseFloat(tier.price) > 0 ? nextBillingDate : null,
        autoRenew: true,
        stripeSubscriptionId,
        stripeCustomerId,
        paymentMethod: paymentMethodId ? "stripe" : null,
        metadata: {
          tierName: tier.name,
          price: tier.price,
          interval: tier.interval,
        },
      })
      .returning();

    logger.info("Subscription created", {
      userId,
      tierId: tier.id,
      tierName: tier.name,
    });

    res.json({
      subscription: newSubscription,
      tier,
      message: `Successfully subscribed to ${tier.name} plan`,
    });
  } catch (error) {
    logger.error("Failed to create subscription", { error });
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

// Cancel subscription
router.post("/cancel", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Get active subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    if (!subscription) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Cancel Stripe subscription if exists
    if (stripe && subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      } catch (stripeError) {
        logger.error("Failed to cancel Stripe subscription", { stripeError });
      }
    }

    // Update subscription status
    const endDate = new Date();
    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        endDate,
        autoRenew: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    logger.info("Subscription cancelled", {
      userId,
      subscriptionId: subscription.id,
    });

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
      endDate,
    });
  } catch (error) {
    logger.error("Failed to cancel subscription", { error });
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// Check subscription limits
router.get("/check-limits/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const { feature } = req.query;

    // Get user's subscription
    const [subscription] = await db
      .select({
        subscription: subscriptions,
        tier: subscriptionTiers,
      })
      .from(subscriptions)
      .leftJoin(subscriptionTiers, eq(subscriptions.tierId, subscriptionTiers.id))
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active")
        )
      )
      .limit(1);

    let tier = subscription?.tier;
    
    // Default to free tier if no subscription
    if (!tier) {
      [tier] = await db
        .select()
        .from(subscriptionTiers)
        .where(eq(subscriptionTiers.slug, "free"))
        .limit(1);
    }

    const limits = (tier?.limits as any) || {};
    const hasAccess = feature ? checkFeatureAccess(limits, feature as string) : true;

    res.json({
      tier: tier?.name || "Free",
      limits,
      hasAccess,
      features: tier?.features || [],
    });
  } catch (error) {
    logger.error("Failed to check subscription limits", { error });
    res.status(500).json({ error: "Failed to check limits" });
  }
});

// Helper function to check feature access
function checkFeatureAccess(limits: any, feature: string): boolean {
  if (!limits[feature]) return true;
  return limits[feature] === -1 || limits[feature] > 0;
}

export default router;