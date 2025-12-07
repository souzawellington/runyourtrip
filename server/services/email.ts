import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@runyourtrip.com';
const APP_NAME = 'Run Your Trip';

// Brand colors
const BRAND_COLORS = {
    primary: '#FF7A2E', // Orange
    background: '#28282D', // Dark gray
    card: '#3A3A40', // Medium gray
    text: '#EFEFEF', // Light text
    muted: '#9E9E9E', // Muted text
};

if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid initialized');
} else {
    console.warn('⚠️ SENDGRID_API_KEY not configured - emails will be disabled');
}

/**
 * Email Service for Run Your Trip
 * Handles all transactional emails with branded templates
 */
class EmailService {
    private isConfigured: boolean;

    constructor() {
        this.isConfigured = !!SENDGRID_API_KEY;
    }

    /**
     * Check if email service is configured
     */
    isEnabled(): boolean {
        return this.isConfigured;
    }

    /**
     * Send purchase confirmation email with download link
     */
    async sendPurchaseConfirmation(
        to: string,
        productName: string,
        downloadUrl: string
    ): Promise<boolean> {
        if (!this.isConfigured) {
            console.warn('📧 Email not sent (SendGrid not configured):', { to, productName });
            return false;
        }

        const msg = {
            to,
            from: FROM_EMAIL,
            subject: `🎉 Your ${productName} is Ready!`,
            html: this.wrapInTemplate(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h1 style="color: ${BRAND_COLORS.text}; font-size: 28px; margin-bottom: 8px;">
            Thank You for Your Purchase!
          </h1>
          <p style="color: ${BRAND_COLORS.muted}; font-size: 16px; margin-bottom: 32px;">
            Your <strong style="color: ${BRAND_COLORS.primary}">${productName}</strong> is ready to download.
          </p>
        </div>

        <div style="background: ${BRAND_COLORS.card}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: ${BRAND_COLORS.text}; font-size: 18px; margin-bottom: 16px;">
            📦 What's Included
          </h2>
          <ul style="color: ${BRAND_COLORS.text}; padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Complete template source code</li>
            <li style="margin-bottom: 8px;">Documentation and setup guide</li>
            <li style="margin-bottom: 8px;">Responsive design for all devices</li>
            <li>Lifetime access to updates</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${downloadUrl}" 
             style="display: inline-block; 
                    background: ${BRAND_COLORS.primary}; 
                    color: white; 
                    padding: 16px 48px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    font-size: 18px;
                    box-shadow: 0 4px 20px rgba(255, 122, 46, 0.4);">
            ⬇️ Download Now
          </a>
        </div>

        <p style="color: ${BRAND_COLORS.muted}; font-size: 12px; text-align: center; margin-top: 32px;">
          This download link will expire in 7 days. If you have any issues, 
          please contact our support team.
        </p>
      `),
        };

        try {
            await sgMail.send(msg);
            console.log('📧 Purchase confirmation sent to:', to);
            return true;
        } catch (error: any) {
            console.error('❌ SendGrid error:', error.response?.body || error.message);
            throw error;
        }
    }

    /**
     * Send welcome email to new users
     */
    async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
        if (!this.isConfigured) {
            console.warn('📧 Email not sent (SendGrid not configured):', { to, userName });
            return false;
        }

        const appUrl = process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : 'http://localhost:5000';

        const msg = {
            to,
            from: FROM_EMAIL,
            subject: `🌍 Welcome to ${APP_NAME}!`,
            html: this.wrapInTemplate(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">✈️</div>
          <h1 style="color: ${BRAND_COLORS.text}; font-size: 28px; margin-bottom: 8px;">
            Welcome, ${userName}!
          </h1>
          <p style="color: ${BRAND_COLORS.muted}; font-size: 16px; margin-bottom: 32px;">
            You're now part of the ${APP_NAME} community!
          </p>
        </div>

        <div style="background: ${BRAND_COLORS.card}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: ${BRAND_COLORS.text}; font-size: 18px; margin-bottom: 16px;">
            🚀 Get Started
          </h2>
          <ul style="color: ${BRAND_COLORS.text}; padding-left: 20px; margin: 0;">
            <li style="margin-bottom: 8px;">Browse our marketplace of premium travel templates</li>
            <li style="margin-bottom: 8px;">Use AI to generate custom content for your site</li>
            <li style="margin-bottom: 8px;">Deploy your website with one click</li>
            <li>Sell your own templates and earn revenue</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${appUrl}/marketplace" 
             style="display: inline-block; 
                    background: ${BRAND_COLORS.primary}; 
                    color: white; 
                    padding: 16px 48px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    font-size: 18px;">
            🛒 Browse Templates
          </a>
        </div>
      `),
        };

        try {
            await sgMail.send(msg);
            console.log('📧 Welcome email sent to:', to);
            return true;
        } catch (error: any) {
            console.error('❌ SendGrid error:', error.response?.body || error.message);
            throw error;
        }
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(to: string, resetToken: string): Promise<boolean> {
        if (!this.isConfigured) {
            console.warn('📧 Email not sent (SendGrid not configured):', { to });
            return false;
        }

        const appUrl = process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : 'http://localhost:5000';
        const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

        const msg = {
            to,
            from: FROM_EMAIL,
            subject: `🔐 Reset Your Password - ${APP_NAME}`,
            html: this.wrapInTemplate(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
          <h1 style="color: ${BRAND_COLORS.text}; font-size: 28px; margin-bottom: 8px;">
            Password Reset Request
          </h1>
          <p style="color: ${BRAND_COLORS.muted}; font-size: 16px; margin-bottom: 32px;">
            Click the button below to reset your password.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; 
                    background: ${BRAND_COLORS.primary}; 
                    color: white; 
                    padding: 16px 48px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    font-size: 18px;">
            🔑 Reset Password
          </a>
        </div>

        <p style="color: ${BRAND_COLORS.muted}; font-size: 12px; text-align: center; margin-top: 32px;">
          This link will expire in 1 hour. If you didn't request this, 
          please ignore this email.
        </p>
      `),
        };

        try {
            await sgMail.send(msg);
            console.log('📧 Password reset email sent to:', to);
            return true;
        } catch (error: any) {
            console.error('❌ SendGrid error:', error.response?.body || error.message);
            throw error;
        }
    }

    /**
     * Send subscription confirmation email
     */
    async sendSubscriptionConfirmation(
        to: string,
        planName: string,
        nextBillingDate: Date
    ): Promise<boolean> {
        if (!this.isConfigured) {
            console.warn('📧 Email not sent (SendGrid not configured)');
            return false;
        }

        const msg = {
            to,
            from: FROM_EMAIL,
            subject: `🎊 Welcome to ${planName}! - ${APP_NAME}`,
            html: this.wrapInTemplate(`
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎊</div>
          <h1 style="color: ${BRAND_COLORS.text}; font-size: 28px; margin-bottom: 8px;">
            Welcome to ${planName}!
          </h1>
          <p style="color: ${BRAND_COLORS.muted}; font-size: 16px; margin-bottom: 32px;">
            Your subscription is now active.
          </p>
        </div>

        <div style="background: ${BRAND_COLORS.card}; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: ${BRAND_COLORS.text}; font-size: 18px; margin-bottom: 16px;">
            📋 Subscription Details
          </h2>
          <table style="width: 100%; color: ${BRAND_COLORS.text};">
            <tr>
              <td style="padding: 8px 0; color: ${BRAND_COLORS.muted};">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: ${BRAND_COLORS.muted};">Next Billing</td>
              <td style="padding: 8px 0; text-align: right;">${nextBillingDate.toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <p style="color: ${BRAND_COLORS.muted}; font-size: 12px; text-align: center; margin-top: 32px;">
          You can manage your subscription anytime from your dashboard.
        </p>
      `),
        };

        try {
            await sgMail.send(msg);
            console.log('📧 Subscription confirmation sent to:', to);
            return true;
        } catch (error: any) {
            console.error('❌ SendGrid error:', error.response?.body || error.message);
            throw error;
        }
    }

    /**
     * Wrap email content in branded template
     */
    private wrapInTemplate(content: string): string {
        const appUrl = process.env.REPLIT_DOMAINS
            ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
            : 'http://localhost:5000';

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: ${BRAND_COLORS.background};
    }
  </style>
</head>
<body style="background: ${BRAND_COLORS.background}; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: ${BRAND_COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 32px;">
              <div style="display: inline-block; 
                          background: ${BRAND_COLORS.primary}; 
                          width: 48px; 
                          height: 48px; 
                          border-radius: 12px; 
                          line-height: 48px;
                          font-size: 24px;
                          box-shadow: 0 4px 20px rgba(255, 122, 46, 0.4);">
                ✈️
              </div>
              <div style="color: ${BRAND_COLORS.text}; 
                          font-size: 20px; 
                          font-weight: 700; 
                          letter-spacing: 1px; 
                          margin-top: 12px;
                          text-transform: uppercase;">
                ${APP_NAME}
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background: ${BRAND_COLORS.background}; padding: 0;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 40px; text-align: center; border-top: 1px solid ${BRAND_COLORS.card}; margin-top: 40px;">
              <p style="color: ${BRAND_COLORS.muted}; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
              <p style="color: ${BRAND_COLORS.muted}; font-size: 12px; margin-top: 8px;">
                <a href="${appUrl}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">
                  Visit our website
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
}

// Export singleton instance
export const emailService = new EmailService();
