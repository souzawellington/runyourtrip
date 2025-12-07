import Stripe from 'stripe';

// Initialize Stripe with API v2 preview version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// Service for managing Stripe Connected Accounts
export class StripeConnectService {
  /**
   * Create a connected account with both customer and merchant configurations
   * This allows the account to:
   * 1. Pay subscription fees to the platform (customer config)
   * 2. Accept payments from their own customers (merchant config)
   */
  async createConnectedAccount(data: {
    email: string;
    businessName: string;
    country?: string;
    entityType?: 'individual' | 'company';
  }) {
    try {
      // Create the account with v2 API
      const account = await stripe.accounts.create({
        type: 'custom',
        country: data.country || 'US',
        email: data.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: data.entityType || 'individual',
        business_profile: {
          name: data.businessName,
          product_description: 'Website templates and digital products',
        },
        tos_acceptance: {
          service_agreement: 'full',
        },
        metadata: {
          platform: 'RUN YOUR TRIP',
          accountType: 'template_creator',
        },
      });

      return {
        success: true,
        accountId: account.id,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      };
    } catch (error: any) {
      console.error('Error creating connected account:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create an account link for onboarding
   * This generates a URL where the connected account can complete their onboarding
   */
  async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
        collect: 'eventually_due',
      });

      return {
        success: true,
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
      };
    } catch (error: any) {
      console.error('Error creating account link:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a subscription for the connected account to pay platform fees
   */
  async createPlatformSubscription(data: {
    accountId: string;
    priceId: string;
    trialDays?: number;
  }) {
    try {
      // First, get or create a customer for the connected account
      const customers = await stripe.customers.list({
        email: data.accountId + '@connect.stripe',
        limit: 1,
      });

      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: data.accountId + '@connect.stripe',
          metadata: {
            connectedAccountId: data.accountId,
            type: 'platform_subscription',
          },
        });
      }

      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: data.priceId }],
        trial_period_days: data.trialDays || 14,
        metadata: {
          connectedAccountId: data.accountId,
          platformName: 'RUN YOUR TRIP',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        trialEnd: subscription.trial_end,
      };
    } catch (error: any) {
      console.error('Error creating platform subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process a payment on behalf of a connected account (destination charge)
   */
  async createDestinationCharge(data: {
    amount: number;
    currency?: string;
    connectedAccountId: string;
    applicationFeeAmount?: number;
    description?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency || 'usd',
        application_fee_amount: data.applicationFeeAmount ? Math.round(data.applicationFeeAmount * 100) : undefined,
        transfer_data: {
          destination: data.connectedAccountId,
        },
        description: data.description,
        metadata: {
          ...data.metadata,
          platformName: 'RUN YOUR TRIP',
        },
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        applicationFee: paymentIntent.application_fee_amount,
      };
    } catch (error: any) {
      console.error('Error creating destination charge:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get connected account details
   */
  async getAccount(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      
      return {
        success: true,
        account: {
          id: account.id,
          email: account.email,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
          capabilities: account.capabilities,
          requirements: account.requirements,
          businessProfile: account.business_profile,
        },
      };
    } catch (error: any) {
      console.error('Error retrieving account:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a login link for the connected account's Stripe dashboard
   */
  async createLoginLink(accountId: string) {
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      
      return {
        success: true,
        url: loginLink.url,
      };
    } catch (error: any) {
      console.error('Error creating login link:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all connected accounts for the platform
   */
  async listConnectedAccounts(limit: number = 10) {
    try {
      const accounts = await stripe.accounts.list({
        limit,
      });

      return {
        success: true,
        accounts: accounts.data.map(account => ({
          id: account.id,
          email: account.email,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          created: account.created,
          businessProfile: account.business_profile,
        })),
        hasMore: accounts.has_more,
      };
    } catch (error: any) {
      console.error('Error listing connected accounts:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create platform pricing plans for subscriptions
   */
  async createPricingPlan(data: {
    productName: string;
    amount: number;
    currency?: string;
    interval?: 'month' | 'year';
  }) {
    try {
      // Create a product
      const product = await stripe.products.create({
        name: data.productName,
        metadata: {
          platform: 'RUN YOUR TRIP',
        },
      });

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(data.amount * 100),
        currency: data.currency || 'usd',
        recurring: {
          interval: data.interval || 'month',
        },
      });

      return {
        success: true,
        productId: product.id,
        priceId: price.id,
        amount: price.unit_amount,
        interval: price.recurring?.interval,
      };
    } catch (error: any) {
      console.error('Error creating pricing plan:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Transfer funds to a connected account
   */
  async createTransfer(data: {
    amount: number;
    currency?: string;
    destination: string;
    description?: string;
  }) {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency || 'usd',
        destination: data.destination,
        description: data.description || 'Platform transfer',
      });

      return {
        success: true,
        transferId: transfer.id,
        amount: transfer.amount,
        created: transfer.created,
      };
    } catch (error: any) {
      console.error('Error creating transfer:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const stripeConnectService = new StripeConnectService();