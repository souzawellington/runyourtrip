
import { Router } from 'express';
import { godaddyDNSService } from '../services/godaddy-dns';
import { verifyAdminToken } from '../middleware/admin-auth';

const router = Router();

// Apply admin authentication to all routes
router.use(verifyAdminToken);

/**
 * Add OpenAI domain verification TXT record
 */
router.post('/verify-domain', async (req, res) => {
  try {
    const { domain, verificationValue } = req.body;

    if (!domain || !verificationValue) {
      return res.status(400).json({ 
        error: 'Domain and verification value are required' 
      });
    }

    await godaddyDNSService.addVerificationRecord(domain, verificationValue);

    res.json({ 
      success: true,
      message: `Verification TXT record added for ${domain}`,
      instructions: 'DNS propagation may take 5-15 minutes. You can verify at https://whatsmydns.net/'
    });
  } catch (error) {
    console.error('Error adding verification record:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to add DNS record' 
    });
  }
});

/**
 * Get all DNS records for a domain
 */
router.get('/records/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const { type } = req.query;

    const records = await godaddyDNSService.getDNSRecords(
      domain, 
      type as string | undefined
    );

    res.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching DNS records:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch DNS records' 
    });
  }
});

/**
 * Add Replit deployment A record
 */
router.post('/add-replit-domain', async (req, res) => {
  try {
    const { domain, ipAddress } = req.body;

    if (!domain || !ipAddress) {
      return res.status(400).json({ 
        error: 'Domain and IP address are required' 
      });
    }

    // Add both A and TXT records for Replit
    await godaddyDNSService.addReplitARecord(domain, ipAddress);

    res.json({ 
      success: true,
      message: `Replit A record added for ${domain}`,
      nextSteps: 'Link this domain in your Replit Deployment settings'
    });
  } catch (error) {
    console.error('Error adding Replit domain:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to add Replit domain' 
    });
  }
});

/**
 * Add multiple DNS records at once
 */
router.post('/add-records', async (req, res) => {
  try {
    const { domain, records } = req.body;

    if (!domain || !records || !Array.isArray(records)) {
      return res.status(400).json({ 
        error: 'Domain and records array are required' 
      });
    }

    await godaddyDNSService.addMultipleRecords(domain, records);

    res.json({ 
      success: true,
      message: `${records.length} DNS records added for ${domain}`
    });
  } catch (error) {
    console.error('Error adding DNS records:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to add DNS records' 
    });
  }
});

/**
 * Verify domain ownership
 */
router.post('/verify-ownership', async (req, res) => {
  try {
    const { domain, verificationValue } = req.body;

    if (!domain || !verificationValue) {
      return res.status(400).json({ 
        error: 'Domain and verification value are required' 
      });
    }

    const isVerified = await godaddyDNSService.verifyDomainOwnership(
      domain, 
      verificationValue
    );

    res.json({ 
      success: true,
      verified: isVerified,
      message: isVerified 
        ? 'Domain ownership verified successfully' 
        : 'Verification record not found. Please wait for DNS propagation.'
    });
  } catch (error) {
    console.error('Error verifying domain ownership:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to verify domain ownership' 
    });
  }
});

export default router;
