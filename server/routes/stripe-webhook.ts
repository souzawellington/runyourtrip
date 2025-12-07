import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';
import { emailService } from '../services/email';

const router = Router();

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Webhook Handler
 * 
 * This endpoint receives events from Stripe when:
 * - A checkout session is completed (customer made a purchase)
 * - A subscription is created, updated, or deleted
 * 
 * IMPORTANT: This route must use express.raw() middleware, not express.json()
 * The raw body is required for webhook signature verification.
 */
router.post('/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('⚠️ STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!signature) {
        console.error('⚠️ Missing stripe-signature header');
        return res.status(400).json({ error: 'Missing signature' });
    }

    let event: Stripe.Event;

    try {
        // Verify the webhook signature
        event = stripe.webhooks.constructEvent(
            req.body, // Must be raw body (Buffer)
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log(`📨 Received Stripe event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                await handleSubscriptionChange(event.data.object as Stripe.Subscription, 'active');
                break;
            }

            case 'customer.subscription.deleted': {
                await handleSubscriptionChange(event.data.object as Stripe.Subscription, 'canceled');
                break;
            }

            case 'payment_intent.succeeded': {
                await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;
            }

            case 'invoice.payment_succeeded': {
                console.log('✅ Invoice payment succeeded');
                break;
            }

            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error: any) {
        console.error(`❌ Error processing webhook: ${error.message}`);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * Handle successful checkout session
 * This is triggered when a customer completes a purchase
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('✅ Checkout session completed:', session.id);

    // Extract metadata
    const productId = session.metadata?.productId;
    const userId = session.metadata?.userId;
    const productName = session.metadata?.productName;

    if (!productId || !userId) {
        console.error('❌ Missing metadata in checkout session:', { productId, userId });
        return;
    }

    try {
        // Get template/product information
        const template = await storage.getTemplate(parseInt(productId));
        if (!template) {
            console.error('❌ Template not found:', productId);
            return;
        }

        // Record purchase in database
        const purchase = await storage.createPurchase({
            userId,
            templateId: parseInt(productId),
            sellerId: template.userId,
            purchasePrice: (session.amount_total! / 100).toString(), // Convert from cents
            transactionId: session.id,
            paymentMethod: 'stripe',
            status: 'completed',
            metadata: {
                stripeSessionId: session.id,
                customerEmail: session.customer_email,
                paymentStatus: session.payment_status,
            },
        });

        console.log('📝 Purchase recorded:', purchase.id);

        // Update template sales count
        await storage.updateTemplate(parseInt(productId), {
            sales: (template.sales || 0) + 1,
        });

        // Generate secure download token
        const { generateDownloadToken } = await import('../utils/security');
        const downloadToken = generateDownloadToken(purchase.id);
        const downloadUrl = `${process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : 'http://localhost:5000'}/api/download/${purchase.id}?token=${downloadToken}`;

        // Send purchase confirmation email
        if (session.customer_email) {
            try {
                await emailService.sendPurchaseConfirmation(
                    session.customer_email,
                    productName || template.name,
                    downloadUrl
                );
                console.log('📧 Confirmation email sent to:', session.customer_email);
            } catch (emailError: any) {
                console.error('⚠️ Failed to send email:', emailError.message);
                // Don't throw - purchase was successful, just email failed
            }
        }

        // Track analytics event
        await storage.createAnalyticsEvent({
            userId,
            templateId: parseInt(productId),
            eventType: 'purchase',
            eventData: {
                amount: session.amount_total! / 100,
                currency: session.currency,
                stripeSessionId: session.id,
            },
        });

        console.log('🎉 Purchase flow completed successfully for user:', userId);

    } catch (error: any) {
        console.error('❌ Error processing checkout:', error.message);
        throw error;
    }
}

/**
 * Handle subscription changes
 */
async function handleSubscriptionChange(
    subscription: Stripe.Subscription,
    action: 'active' | 'canceled'
) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
        console.error('❌ Missing userId in subscription metadata');
        return;
    }

    try {
        // Get the subscription tier from the price
        const priceId = subscription.items.data[0]?.price.id;
        const tier = await storage.getSubscriptionTierByPriceId(priceId);

        if (action === 'active') {
            // Create or update subscription record
            await storage.upsertSubscription({
                userId,
                tierId: tier?.id || 1,
                status: subscription.status === 'active' ? 'active' : 'pending',
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                startDate: new Date(subscription.current_period_start * 1000),
                endDate: new Date(subscription.current_period_end * 1000),
                autoRenew: !subscription.cancel_at_period_end,
                nextBillingDate: new Date(subscription.current_period_end * 1000),
            });

            console.log(`💼 Subscription ${action} for user:`, userId);
        } else {
            // Cancel subscription
            await storage.updateSubscriptionStatus(userId, 'canceled');
            console.log(`❌ Subscription canceled for user:`, userId);
        }

    } catch (error: any) {
        console.error('❌ Error processing subscription:', error.message);
        throw error;
    }
}

/**
 * Handle successful payment intent (for one-time payments without checkout session)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('✅ Payment intent succeeded:', paymentIntent.id);

    const templateId = paymentIntent.metadata?.templateId;
    const templateName = paymentIntent.metadata?.templateName;

    if (templateId) {
        // Update template sales count
        const template = await storage.getTemplate(parseInt(templateId));
        if (template) {
            await storage.updateTemplate(parseInt(templateId), {
                sales: (template.sales || 0) + 1,
            });
            console.log('📈 Updated sales count for template:', templateId);
        }
    }
}

export default router;
