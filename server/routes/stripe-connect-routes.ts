import { Router } from 'express';
import { stripeConnectService } from '../services/stripe-connect';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Create a connected account for the current user
router.post('/api/stripe-connect/create-account', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { businessName, country, entityType } = req.body;

    // Check if user already has a connected account
    const user = await storage.getUser(userId);
    if (user?.stripeAccountId) {
      return res.status(400).json({ 
        message: 'You already have a connected account' 
      });
    }

    // Create the connected account
    const result = await stripeConnectService.createConnectedAccount({
      email: user?.email || req.user.claims.email,
      businessName: businessName || 'RUN YOUR TRIP Creator',
      country: country || 'US',
      entityType: entityType || 'individual',
    });

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    // Save the account ID to the user record
    await storage.updateUserStripeAccount(userId, {
      stripeAccountId: result.accountId!,
      stripeAccountStatus: 'pending',
      stripeOnboardingCompleted: false,
    });

    res.json({
      success: true,
      accountId: result.accountId,
      detailsSubmitted: result.detailsSubmitted,
      chargesEnabled: result.chargesEnabled,
    });
  } catch (error: any) {
    console.error('Error creating connected account:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start onboarding for connected account
router.post('/api/stripe-connect/onboarding', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user?.stripeAccountId) {
      return res.status(400).json({ 
        message: 'No connected account found' 
      });
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const returnUrl = `${protocol}://${host}/stripe-connect/onboarding-complete`;
    const refreshUrl = `${protocol}://${host}/stripe-connect/onboarding-refresh`;

    const result = await stripeConnectService.createAccountLink(
      user.stripeAccountId,
      returnUrl,
      refreshUrl
    );

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json({
      success: true,
      url: result.url,
      expiresAt: result.expiresAt,
    });
  } catch (error: any) {
    console.error('Error creating onboarding link:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get connected account details
router.get('/api/stripe-connect/account', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user?.stripeAccountId) {
      return res.json(null);
    }

    const result = await stripeConnectService.getAccount(user.stripeAccountId);

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    // Update user's account status
    const status = result.account?.chargesEnabled ? 'active' : 
                   result.account?.detailsSubmitted ? 'restricted' : 'pending';
    
    await storage.updateUserStripeAccount(userId, {
      stripeAccountStatus: status,
      stripeOnboardingCompleted: result.account?.detailsSubmitted || false,
    });

    res.json({
      accountId: user.stripeAccountId,
      status: status,
      onboardingCompleted: result.account?.detailsSubmitted || false,
      chargesEnabled: result.account?.chargesEnabled || false,
      payoutsEnabled: result.account?.payoutsEnabled || false,
      detailsSubmitted: result.account?.detailsSubmitted || false,
      requirements: result.account?.requirements,
      capabilities: result.account?.capabilities,
      defaultCurrency: 'usd',
      country: 'US',
      businessProfile: result.account?.businessProfile,
    });
  } catch (error: any) {
    console.error('Error checking account status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create platform subscription for connected account
router.post('/api/stripe-connect/create-subscription', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { planType } = req.body; // 'starter', 'pro', 'enterprise'
    const user = await storage.getUser(userId);

    if (!user?.stripeAccountId) {
      return res.status(400).json({ 
        message: 'No connected account found' 
      });
    }

    // Define pricing plans
    const plans = {
      starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID || '', amount: 29 },
      pro: { priceId: process.env.STRIPE_PRO_PRICE_ID || '', amount: 79 },
      enterprise: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '', amount: 199 },
    };

    const plan = plans[planType as keyof typeof plans] || plans.starter;

    // Create or get the pricing plan
    if (!plan.priceId) {
      const pricingResult = await stripeConnectService.createPricingPlan({
        productName: `RUN YOUR TRIP ${planType.toUpperCase()} Plan`,
        amount: plan.amount,
        currency: 'usd',
        interval: 'month',
      });

      if (!pricingResult.success) {
        return res.status(500).json({ message: pricingResult.error });
      }

      plan.priceId = pricingResult.priceId!;
    }

    // Create the subscription
    const result = await stripeConnectService.createPlatformSubscription({
      accountId: user.stripeAccountId,
      priceId: plan.priceId,
      trialDays: 14,
    });

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    // Save subscription ID to user record
    await storage.updateUserStripeSubscription(userId, result.subscriptionId!);

    res.json({
      success: true,
      subscriptionId: result.subscriptionId,
      status: result.status,
      trialEnd: result.trialEnd,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get Stripe dashboard login link
router.post('/api/stripe-connect/dashboard', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (!user?.stripeAccountId) {
      return res.status(400).json({ 
        message: 'No connected account found' 
      });
    }

    const result = await stripeConnectService.createLoginLink(user.stripeAccountId);

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json({
      success: true,
      url: result.url,
    });
  } catch (error: any) {
    console.error('Error creating dashboard link:', error);
    res.status(500).json({ message: error.message });
  }
});

// Process payment with destination charge
router.post('/api/stripe-connect/destination-charge', isAuthenticated, async (req: any, res) => {
  try {
    const { amount, connectedAccountId, applicationFeePercent, description, metadata } = req.body;

    if (!amount || !connectedAccountId) {
      return res.status(400).json({ 
        message: 'Amount and connected account ID are required' 
      });
    }

    // Calculate application fee (default 10%)
    const feePercent = applicationFeePercent || 10;
    const applicationFeeAmount = amount * (feePercent / 100);

    const result = await stripeConnectService.createDestinationCharge({
      amount,
      connectedAccountId,
      applicationFeeAmount,
      description: description || 'Template purchase',
      metadata: metadata || {},
    });

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json({
      success: true,
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
      amount: result.amount,
      applicationFee: result.applicationFee,
    });
  } catch (error: any) {
    console.error('Error creating destination charge:', error);
    res.status(500).json({ message: error.message });
  }
});

// List all connected accounts (admin only)
router.get('/api/stripe-connect/accounts', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check if user is admin (you may want to implement proper admin check)
    const user = await storage.getUser(userId);
    if (user?.email !== 'admin@runyourtrip.com') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const result = await stripeConnectService.listConnectedAccounts(20);

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    res.json({
      success: true,
      accounts: result.accounts,
      hasMore: result.hasMore,
    });
  } catch (error: any) {
    console.error('Error listing accounts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Handle onboarding complete callback
router.get('/stripe-connect/onboarding-complete', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);

    if (user?.stripeAccountId) {
      // Check account status
      const result = await stripeConnectService.getAccount(user.stripeAccountId);
      
      if (result.success && result.account?.detailsSubmitted) {
        await storage.updateUserStripeAccount(userId, {
          stripeOnboardingCompleted: true,
          stripeAccountStatus: result.account.chargesEnabled ? 'active' : 'restricted',
        });
      }
    }

    // Redirect to dashboard
    res.redirect('/dashboard/stripe-connect');
  } catch (error: any) {
    console.error('Error handling onboarding complete:', error);
    res.redirect('/dashboard/stripe-connect?error=onboarding_failed');
  }
});

// Handle onboarding refresh
router.get('/stripe-connect/onboarding-refresh', isAuthenticated, async (req: any, res) => {
  // Redirect back to the connect dashboard
  res.redirect('/dashboard/stripe-connect?refresh=true');
});

// Update billing settings
router.post('/api/stripe-connect/billing-settings', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { subscriptionEnabled, amount, interval, description } = req.body;
    
    // Store billing settings (you can extend this to save to database)
    res.json({
      success: true,
      message: 'Billing settings updated successfully',
      settings: {
        subscriptionEnabled,
        amount,
        interval,
        description
      }
    });
  } catch (error: any) {
    console.error('Error updating billing settings:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;