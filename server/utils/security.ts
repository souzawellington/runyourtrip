import crypto from 'crypto';

const SECRET = process.env.MANAGEMENT_SECRET || process.env.SESSION_SECRET || 'default-secret-key';
const TOKEN_EXPIRY_DAYS = 7;

/**
 * Security utilities for Run Your Trip
 * Handles secure token generation and validation for downloads
 */

/**
 * Generate a secure download token for a purchase
 * Token format: timestamp.signature
 * 
 * @param purchaseId - The purchase ID to generate token for
 * @returns Secure token string
 */
export function generateDownloadToken(purchaseId: number): string {
    const timestamp = Date.now();
    const data = `${purchaseId}-${timestamp}`;

    const signature = crypto
        .createHmac('sha256', SECRET)
        .update(data)
        .digest('hex');

    // Base64 encode to make it URL-safe
    const token = Buffer.from(`${timestamp}.${signature}`).toString('base64url');

    return token;
}

/**
 * Verify a download token
 * 
 * @param purchaseId - The purchase ID the token should be for
 * @param token - The token to verify
 * @returns Object with valid boolean and optional error message
 */
export function verifyDownloadToken(
    purchaseId: number,
    token: string
): { valid: boolean; error?: string } {
    try {
        // Decode token
        const decoded = Buffer.from(token, 'base64url').toString('utf-8');
        const [timestampStr, signature] = decoded.split('.');

        if (!timestampStr || !signature) {
            return { valid: false, error: 'Invalid token format' };
        }

        const timestamp = parseInt(timestampStr, 10);

        if (isNaN(timestamp)) {
            return { valid: false, error: 'Invalid timestamp' };
        }

        // Check expiration
        const expiryMs = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp > expiryMs) {
            return { valid: false, error: 'Token expired' };
        }

        // Verify signature
        const data = `${purchaseId}-${timestamp}`;
        const expectedSignature = crypto
            .createHmac('sha256', SECRET)
            .update(data)
            .digest('hex');

        if (!crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        )) {
            return { valid: false, error: 'Invalid signature' };
        }

        return { valid: true };

    } catch (error: any) {
        console.error('Token verification error:', error.message);
        return { valid: false, error: 'Token verification failed' };
    }
}

/**
 * Generate a password reset token
 * 
 * @param userId - The user ID
 * @returns Object with token and expiry time
 */
export function generatePasswordResetToken(userId: string): {
    token: string;
    expiresAt: Date;
} {
    const timestamp = Date.now();
    const expiresAt = new Date(timestamp + 60 * 60 * 1000); // 1 hour

    const data = `reset-${userId}-${timestamp}`;
    const signature = crypto
        .createHmac('sha256', SECRET)
        .update(data)
        .digest('hex');

    const token = Buffer.from(`${userId}:${timestamp}:${signature}`).toString('base64url');

    return { token, expiresAt };
}

/**
 * Verify a password reset token
 * 
 * @param token - The token to verify
 * @returns Object with valid boolean, userId if valid, or error
 */
export function verifyPasswordResetToken(token: string): {
    valid: boolean;
    userId?: string;
    error?: string;
} {
    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf-8');
        const [userId, timestampStr, signature] = decoded.split(':');

        if (!userId || !timestampStr || !signature) {
            return { valid: false, error: 'Invalid token format' };
        }

        const timestamp = parseInt(timestampStr, 10);

        // Check expiration (1 hour)
        if (Date.now() - timestamp > 60 * 60 * 1000) {
            return { valid: false, error: 'Token expired' };
        }

        // Verify signature
        const data = `reset-${userId}-${timestamp}`;
        const expectedSignature = crypto
            .createHmac('sha256', SECRET)
            .update(data)
            .digest('hex');

        if (signature !== expectedSignature) {
            return { valid: false, error: 'Invalid signature' };
        }

        return { valid: true, userId };

    } catch (error: any) {
        return { valid: false, error: 'Token verification failed' };
    }
}

/**
 * Generate a random referral code
 * 
 * @returns 8-character alphanumeric code
 */
export function generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

/**
 * Hash a password for storage
 * Note: For production, use bcrypt instead
 */
export function hashPassword(password: string): string {
    return crypto
        .createHash('sha256')
        .update(password + SECRET)
        .digest('hex');
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
}
