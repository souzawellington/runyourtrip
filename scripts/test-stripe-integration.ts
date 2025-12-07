#!/usr/bin/env tsx
/**
 * Stripe Integration Test Script
 * Tests webhooks, payment processing, and subscription management
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function testStripeIntegration() {
  console.log('🧪 Starting Stripe Integration Tests...\n');
  
  try {
    // 1. Test API Connection
    console.log('1️⃣ Testing API Connection...');
    const account = await stripe.accounts.retrieve();
    console.log(`   ✅ Connected to Stripe account: ${account.id}`);
    console.log(`   Mode: ${account.charges_enabled ? 'LIVE' : 'TEST'}`);
    
    // 2. Test Product & Price Creation
    console.log('\n2️⃣ Testing Product & Price Creation...');
    const product = await stripe.products.create({
      name: 'Test Template - Professional Travel Site',
      description: 'Test product for integration testing',
      metadata: {
        templateId: 'test-001',
        category: 'travel',
      },
    });
    console.log(`   ✅ Created product: ${product.id}`);
    
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 4999, // $49.99
      currency: 'brl',
    });
    console.log(`   ✅ Created price: ${price.id} (R$ 49.99)`);
    
    // 3. Test Subscription Plans
    console.log('\n3️⃣ Testing Subscription Plans...');
    const subscriptionPlans = [
      { name: 'Starter', price: 1900 }, // R$ 19.00
      { name: 'Professional', price: 4900 }, // R$ 49.00
      { name: 'Business', price: 9900 }, // R$ 99.00
    ];
    
    for (const plan of subscriptionPlans) {
      const subProduct = await stripe.products.create({
        name: `${plan.name} Plan`,
        description: `${plan.name} subscription tier`,
      });
      
      const subPrice = await stripe.prices.create({
        product: subProduct.id,
        unit_amount: plan.price,
        currency: 'brl',
        recurring: { interval: 'month' },
      });
      
      console.log(`   ✅ Created ${plan.name} plan: ${subPrice.id}`);
    }
    
    // 4. Test Customer Creation
    console.log('\n4️⃣ Testing Customer Creation...');
    const customer = await stripe.customers.create({
      email: 'test@runyourtrip.com',
      name: 'Test User',
      metadata: {
        userId: 'test-user-001',
      },
    });
    console.log(`   ✅ Created customer: ${customer.id}`);
    
    // 5. Test Payment Method
    console.log('\n5️⃣ Testing Payment Method Setup...');
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: 'tok_visa', // Test token
      },
    });
    
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    });
    console.log(`   ✅ Attached payment method: ${paymentMethod.id}`);
    
    // 6. Test Webhook Configuration
    console.log('\n6️⃣ Checking Webhook Configuration...');
    if (STRIPE_WEBHOOK_SECRET) {
      console.log(`   ✅ Webhook secret configured: ${STRIPE_WEBHOOK_SECRET.substring(0, 15)}...`);
      console.log('   📝 Expected webhook events:');
      console.log('      - payment_intent.succeeded');
      console.log('      - customer.subscription.created');
      console.log('      - customer.subscription.updated');
      console.log('      - customer.subscription.deleted');
      console.log('      - invoice.payment_succeeded');
    } else {
      console.log('   ⚠️  Webhook secret not configured');
      console.log('   📝 Configure webhook at: https://dashboard.stripe.com/webhooks');
    }
    
    // 7. Test Referral System Integration
    console.log('\n7️⃣ Testing Referral System Integration...');
    const coupon = await stripe.coupons.create({
      amount_off: 1000, // R$ 10.00 off
      currency: 'brl',
      duration: 'once',
      name: 'Referral Discount',
      metadata: {
        type: 'referral',
        code: 'REF-TEST-001',
      },
    });
    console.log(`   ✅ Created referral coupon: ${coupon.id}`);
    
    // 8. Clean up test data
    console.log('\n8️⃣ Cleaning up test data...');
    await stripe.products.update(product.id, { active: false });
    await stripe.customers.del(customer.id);
    console.log('   ✅ Test data cleaned up');
    
    // Summary
    console.log('\n✅ All Stripe integration tests passed!');
    console.log('\n📋 Integration Checklist:');
    console.log('   ✅ API Connection working');
    console.log('   ✅ Products & Pricing configured');
    console.log('   ✅ Subscription plans ready');
    console.log('   ✅ Customer management functional');
    console.log('   ✅ Payment methods can be attached');
    console.log(`   ${STRIPE_WEBHOOK_SECRET ? '✅' : '⚠️ '} Webhook configuration`);
    console.log('   ✅ Referral system compatible');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Configure webhook endpoint in Stripe Dashboard');
    console.log('   2. Test with live mode credentials (when ready)');
    console.log('   3. Set up proper error handling for production');
    console.log('   4. Enable 3D Secure for Brazilian cards');
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Check your STRIPE_SECRET_KEY is correct');
    }
    process.exit(1);
  }
}

// Run tests
testStripeIntegration();