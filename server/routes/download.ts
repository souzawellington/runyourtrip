import { Router, Request, Response } from 'express';
import archiver from 'archiver';
import { storage } from '../storage';
import { verifyDownloadToken, generateDownloadToken } from '../utils/security';

const router = Router();

/**
 * Secure Download Route
 * 
 * Handles template downloads after purchase verification.
 * Uses token-based authentication with expiration.
 */

/**
 * GET /api/download/:purchaseId
 * Download purchased template as ZIP file
 * 
 * Query params:
 * - token: Secure download token (required)
 */
router.get('/:purchaseId', async (req: Request, res: Response) => {
    const { purchaseId } = req.params;
    const { token } = req.query;

    // Validate inputs
    if (!purchaseId || isNaN(parseInt(purchaseId))) {
        return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    if (!token || typeof token !== 'string') {
        return res.status(401).json({ error: 'Download token required' });
    }

    const purchaseIdNum = parseInt(purchaseId);

    // Verify token
    const tokenResult = verifyDownloadToken(purchaseIdNum, token);
    if (!tokenResult.valid) {
        console.warn(`⚠️ Invalid download token for purchase ${purchaseId}: ${tokenResult.error}`);
        return res.status(401).json({
            error: 'Invalid or expired download token',
            details: tokenResult.error
        });
    }

    try {
        // Get purchase record
        const purchase = await storage.getPurchase(purchaseIdNum);
        if (!purchase) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        // Get template
        const template = await storage.getTemplate(purchase.templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        console.log(`📦 Generating download for template: ${template.name}`);

        // Track download
        await storage.createAnalyticsEvent({
            userId: purchase.userId,
            templateId: template.id,
            eventType: 'download',
            eventData: {
                purchaseId: purchaseIdNum,
                templateName: template.name,
            },
        });

        // Update template download count
        await storage.updateTemplate(template.id, {
            downloads: (template.downloads || 0) + 1,
        });

        // Set response headers for ZIP download
        const filename = `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.zip`;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Create ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        // Pipe archive to response
        archive.pipe(res);

        // Add README
        archive.append(generateReadme(template), {
            name: 'README.md'
        });

        // Add main template code
        if (template.code) {
            // Parse code if it's JSON (contains multiple files)
            try {
                const codeObj = JSON.parse(template.code);

                if (codeObj.html) {
                    archive.append(codeObj.html, { name: 'index.html' });
                }
                if (codeObj.css) {
                    archive.append(codeObj.css, { name: 'styles.css' });
                }
                if (codeObj.js || codeObj.javascript) {
                    archive.append(codeObj.js || codeObj.javascript, { name: 'script.js' });
                }

                // If there are additional files
                if (codeObj.files && Array.isArray(codeObj.files)) {
                    for (const file of codeObj.files) {
                        archive.append(file.content, { name: file.name });
                    }
                }
            } catch {
                // Code is a single HTML file
                archive.append(template.code, { name: 'index.html' });
            }
        }

        // Add package.json for SaaS templates
        if (template.category === 'saas' || template.category === 'booking') {
            archive.append(generatePackageJson(template), { name: 'package.json' });
        }

        // Add license
        archive.append(generateLicense(purchase.userId), { name: 'LICENSE' });

        // Finalize archive
        await archive.finalize();

        console.log(`✅ Download completed for purchase ${purchaseId}`);

    } catch (error: any) {
        console.error(`❌ Download error for purchase ${purchaseId}:`, error.message);

        // Don't send error if headers already sent
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate download' });
        }
    }
});

/**
 * POST /api/download/generate-link/:purchaseId
 * Generate a new download link for a purchase (authenticated)
 */
router.post('/generate-link/:purchaseId', async (req: Request, res: Response) => {
    const { purchaseId } = req.params;
    const userId = (req as any).user?.claims?.sub;

    if (!purchaseId || isNaN(parseInt(purchaseId))) {
        return res.status(400).json({ error: 'Invalid purchase ID' });
    }

    try {
        // Get purchase and verify ownership
        const purchase = await storage.getPurchase(parseInt(purchaseId));
        if (!purchase) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        if (purchase.userId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Generate new token
        const token = generateDownloadToken(purchase.id);

        const baseUrl = process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : 'http://localhost:5000';

        const downloadUrl = `${baseUrl}/api/download/${purchase.id}?token=${token}`;

        res.json({
            success: true,
            downloadUrl,
            expiresIn: '7 days'
        });

    } catch (error: any) {
        console.error('Generate link error:', error.message);
        res.status(500).json({ error: 'Failed to generate download link' });
    }
});

/**
 * Generate README.md content for template
 */
function generateReadme(template: any): string {
    return `# ${template.name}

Thank you for purchasing this template from Run Your Trip!

## Description

${template.description}

## Getting Started

1. Extract all files from this ZIP
2. Open \`index.html\` in your browser to preview
3. Edit the HTML, CSS, and JS files as needed
4. Deploy to your hosting provider

## Files Included

- \`index.html\` - Main HTML template
- \`styles.css\` - Styling
- \`script.js\` - JavaScript functionality (if applicable)
- \`README.md\` - This file
- \`LICENSE\` - License information

## Customization

### Colors
Edit the CSS variables in \`styles.css\` to change the color scheme.

### Content
Replace placeholder text and images with your own content.

### Deployment
You can deploy this template to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## Support

If you have any questions, please contact us at:
- Email: support@runyourtrip.com
- Website: https://runyourtrip.com

## License

This template is licensed for use by the purchaser only.
See LICENSE file for details.

---

Made with ❤️ by Run Your Trip
`;
}

/**
 * Generate package.json for SaaS templates
 */
function generatePackageJson(template: any): string {
    const slug = template.name.toLowerCase().replace(/\s+/g, '-');

    return JSON.stringify({
        name: slug,
        version: '1.0.0',
        description: template.description,
        main: 'index.js',
        scripts: {
            start: 'node index.js',
            dev: 'nodemon index.js',
            build: 'npm run build'
        },
        dependencies: {
            express: '^4.18.0',
        },
        devDependencies: {
            nodemon: '^3.0.0'
        },
        author: 'Run Your Trip',
        license: 'SEE LICENSE FILE'
    }, null, 2);
}

/**
 * Generate LICENSE file
 */
function generateLicense(userId: string): string {
    const year = new Date().getFullYear();

    return `RUN YOUR TRIP TEMPLATE LICENSE

Copyright (c) ${year} Run Your Trip

LICENSED TO: ${userId}
PURCHASE DATE: ${new Date().toISOString().split('T')[0]}

PERMITTED USES:
- Use the template for personal or commercial projects
- Modify the template as needed
- Deploy the template to any hosting provider
- Create unlimited websites using this template

NOT PERMITTED:
- Reselling or redistributing the template
- Sharing with third parties
- Claiming as your own creation
- Removing attribution (where visible)

This license is non-transferable and applies only to the 
original purchaser.

For questions about licensing:
support@runyourtrip.com
`;
}

export default router;
