# Stripe Payment Links Setup Guide

## Quick Setup

Your sales page is now available at `/sales` or `/pricing`!

## Required Environment Variables

To enable the checkout functionality, you need to add the following environment variables (Stripe Payment Links) in your Replit Secrets:

### Membership Plans

```
PL_STARTER_MONTHLY=https://buy.stripe.com/your_starter_monthly_link
PL_STARTER_YEARLY=https://buy.stripe.com/your_starter_yearly_link
PL_PRO_MONTHLY=https://buy.stripe.com/your_pro_monthly_link
PL_PRO_YEARLY=https://buy.stripe.com/your_pro_yearly_link
PL_BUSINESS_MONTHLY=https://buy.stripe.com/your_business_monthly_link
PL_BUSINESS_YEARLY=https://buy.stripe.com/your_business_yearly_link
```

### Catalog Products

```
PL_P1=https://buy.stripe.com/your_product1_link
PL_P2=https://buy.stripe.com/your_product2_link
PL_P3=https://buy.stripe.com/your_product3_link
PL_P4=https://buy.stripe.com/your_product4_link
PL_P5=https://buy.stripe.com/your_product5_link
PL_P6=https://buy.stripe.com/your_product6_link
PL_P7=https://buy.stripe.com/your_product7_link
PL_P8=https://buy.stripe.com/your_product8_link
PL_P9=https://buy.stripe.com/your_product9_link
PL_P10=https://buy.stripe.com/your_product10_link
```

## How to Create Stripe Payment Links

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Payment Links**
3. Click **+ New payment link**
4. Configure your product/subscription:
   - Select or create a product
   - Set pricing (one-time or recurring)
   - Configure thank you page
   - Enable customer info collection
5. Click **Create link**
6. Copy the generated link
7. Add it to your Replit Secrets with the appropriate key name

## Features

- **Sales Page URL**: `/sales` or `/pricing`
- **API Endpoints**:
  - `/api/sales/checkout-links` - Returns all configured payment links
  - `/api/sales/buy/:key` - Redirects to specific payment link
- **Auto-fetch**: The sales page automatically fetches payment links from the API
- **Monthly/Yearly Toggle**: Switches between monthly and yearly pricing
- **Responsive Design**: Works on all device sizes

## Testing

1. After adding your environment variables, restart your application
2. Visit `/sales` to see your pricing page
3. Click any "Buy" or "Get Started" button to test the redirect to Stripe

## Customization

The sales page HTML is located at: `client/public/sales/pricing-catalog.html`

You can customize:
- Pricing amounts
- Product descriptions
- Colors and styling
- Features list
- FAQ section

## Domain Configuration

For production deployment at `https://www.runyourtrip.com.br`:
- Ensure your Stripe account is configured for this domain
- Update any webhook endpoints in Stripe to use this domain
- Configure CORS settings if needed

## Support

For issues with:
- **Payment Links**: Check Stripe Dashboard → Payment Links
- **Environment Variables**: Check Replit Secrets
- **Page Not Loading**: Check server logs for errors