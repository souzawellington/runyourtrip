import { Router } from "express";
import { db } from "../db";
import { referrals, users, purchases } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "../utils/centralized-logger";

const router = Router();

// Generate a referral code for a user
router.post("/generate", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user already has a referral code
    const existingReferral = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referrerId, userId),
          eq(referrals.status, "pending")
        )
      )
      .limit(1);

    if (existingReferral.length > 0) {
      return res.json({
        referralCode: existingReferral[0].referralCode,
        message: "Existing referral code retrieved",
      });
    }

    // Generate unique referral code
    const generateCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let referralCode = generateCode();
    let attempts = 0;

    // Ensure code is unique
    while (attempts < 10) {
      const existing = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);

      if (existing.length === 0) break;
      
      referralCode = generateCode();
      attempts++;
    }

    // Create referral
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const [newReferral] = await db
      .insert(referrals)
      .values({
        referrerId: userId,
        referralCode,
        status: "pending",
        reward: "10.00", // $10 credit for successful referral
        rewardType: "credit",
        expiresAt,
        metadata: {
          shareLink: `/signup?ref=${referralCode}`,
          createdAt: new Date().toISOString(),
        },
      })
      .returning();

    logger.info("Referral code generated", { userId, referralCode });

    res.json({
      referralCode,
      shareLink: `/signup?ref=${referralCode}`,
      expiresAt,
      reward: "$10 credit",
      message: "Referral code generated successfully",
    });
  } catch (error) {
    logger.error("Failed to generate referral code", { error });
    res.status(500).json({ error: "Failed to generate referral code" });
  }
});

// Apply a referral code
router.post("/apply", async (req: any, res) => {
  try {
    const { referralCode, newUserId } = req.body;

    if (!referralCode || !newUserId) {
      return res.status(400).json({ error: "Referral code and user ID required" });
    }

    // Find the referral
    const [referral] = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referralCode, referralCode),
          eq(referrals.status, "pending")
        )
      )
      .limit(1);

    if (!referral) {
      return res.status(404).json({ error: "Invalid or expired referral code" });
    }

    // Check if expired
    if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) {
      await db
        .update(referrals)
        .set({ status: "expired" })
        .where(eq(referrals.id, referral.id));
      
      return res.status(400).json({ error: "Referral code has expired" });
    }

    // Update referral with referred user
    await db
      .update(referrals)
      .set({
        referredUserId: newUserId,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(referrals.id, referral.id));

    // TODO: Apply rewards (credits/discounts) to both users
    // This would integrate with your payment/credit system

    logger.info("Referral applied", { 
      referralCode, 
      referrerId: referral.referrerId,
      referredUserId: newUserId 
    });

    res.json({
      success: true,
      message: "Referral applied successfully",
      reward: referral.reward,
    });
  } catch (error) {
    logger.error("Failed to apply referral", { error });
    res.status(500).json({ error: "Failed to apply referral" });
  }
});

// Get user's referral stats
router.get("/stats/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all referrals by this user
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const stats = {
      totalReferrals: userReferrals.length,
      pendingReferrals: userReferrals.filter(r => r.status === "pending").length,
      completedReferrals: userReferrals.filter(r => r.status === "completed").length,
      totalRewards: userReferrals
        .filter(r => r.status === "completed")
        .reduce((sum, r) => sum + parseFloat(r.reward || "0"), 0),
      activeCode: userReferrals.find(r => r.status === "pending")?.referralCode,
      referralHistory: userReferrals.map(r => ({
        code: r.referralCode,
        status: r.status,
        reward: r.reward,
        completedAt: r.completedAt,
        expiresAt: r.expiresAt,
      })),
    };

    res.json(stats);
  } catch (error) {
    logger.error("Failed to get referral stats", { error });
    res.status(500).json({ error: "Failed to get referral stats" });
  }
});

// Check if a referral code is valid
router.get("/validate/:code", async (req, res) => {
  try {
    const referralCode = req.params.code;

    const [referral] = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referralCode, referralCode),
          eq(referrals.status, "pending")
        )
      )
      .limit(1);

    if (!referral) {
      return res.json({ valid: false, message: "Invalid referral code" });
    }

    if (referral.expiresAt && new Date(referral.expiresAt) < new Date()) {
      return res.json({ valid: false, message: "Referral code has expired" });
    }

    res.json({
      valid: true,
      reward: referral.reward,
      rewardType: referral.rewardType,
      message: "Valid referral code",
    });
  } catch (error) {
    logger.error("Failed to validate referral code", { error });
    res.status(500).json({ error: "Failed to validate referral code" });
  }
});

export default router;