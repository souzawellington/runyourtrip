import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

// Membership plan keys
const MEMBERSHIP_KEYS = [
  'starter_monthly', 'starter_yearly',
  'pro_monthly', 'pro_yearly',
  'business_monthly', 'business_yearly'
];

// Function to load payment links from environment variables
function loadPaymentLinks() {
  const membership: Record<string, string> = {};
  const catalog: Record<string, string> = {};

  // Load membership links
  MEMBERSHIP_KEYS.forEach(key => {
    const envKey = `PL_${key.toUpperCase()}`;
    const value = process.env[envKey];
    if (value) {
      membership[key] = value.trim();
    }
  });

  // Load catalog product links (P1 through P10)
  for (let i = 1; i <= 10; i++) {
    const envKey = `PL_P${i}`;
    const value = process.env[envKey];
    if (value) {
      catalog[`p${i}`] = value.trim();
    }
  }

  return { membership, catalog };
}

// API endpoint to fetch checkout links
router.get('/api/sales/checkout-links', (req: Request, res: Response) => {
  const links = loadPaymentLinks();
  res.json(links);
});

// Redirect endpoint for direct links (e.g., /buy/pro_yearly)
router.get('/api/sales/buy/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const links = loadPaymentLinks();
  
  // Check if it's a membership plan
  let url = links.membership[key];
  
  // If not found in membership, check catalog
  if (!url) {
    url = links.catalog[key];
  }
  
  if (url) {
    res.redirect(302, url);
  } else {
    res.status(404).json({ 
      error: 'Payment link not configured', 
      key: key 
    });
  }
});

// Serve the sales page
router.get('/sales', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'client/public/sales/pricing-catalog.html'));
});

// Serve the pricing page (alias)
router.get('/pricing', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'client/public/sales/pricing-catalog.html'));
});

export default router;