import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// HTML/Script tag detection patterns
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const EVENT_HANDLER_PATTERN = /on\w+\s*=/gi;
const JAVASCRIPT_URI_PATTERN = /javascript:/gi;
const DATA_URI_SCRIPT_PATTERN = /data:.*script/gi;

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi,
  /(--|\|\||\/\*|\*\/)/g, // SQL comments
  /(\bOR\b\s*\d+\s*=\s*\d+|\bAND\b\s*\d+\s*=\s*\d+)/gi, // Common SQL injection patterns
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.%2[fF]/g,
  /%2e%2e/gi,
];

/**
 * Sanitize string input by removing potentially dangerous content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  
  let sanitized = input;
  
  // Remove script tags
  sanitized = sanitized.replace(SCRIPT_PATTERN, '');
  
  // Remove HTML tags
  sanitized = sanitized.replace(HTML_TAG_PATTERN, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(EVENT_HANDLER_PATTERN, '');
  
  // Remove javascript: URIs
  sanitized = sanitized.replace(JAVASCRIPT_URI_PATTERN, '');
  
  // Remove data URIs with scripts
  sanitized = sanitized.replace(DATA_URI_SCRIPT_PATTERN, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
}

/**
 * Check for SQL injection attempts
 */
export function detectSQLInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

/**
 * Check for path traversal attempts
 */
export function detectPathTraversal(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

/**
 * Deep sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key as well
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Express middleware for input sanitization
 */
export const sanitizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query as any);
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  // Check for malicious patterns
  const allInputs = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });
  
  if (detectSQLInjection(allInputs)) {
    console.warn(`[SECURITY] SQL injection attempt detected from IP: ${req.ip}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  
  if (detectPathTraversal(allInputs)) {
    console.warn(`[SECURITY] Path traversal attempt detected from IP: ${req.ip}`);
    return res.status(400).json({ error: 'Invalid input detected' });
  }
  
  next();
};

/**
 * Create a sanitized schema validator
 */
export function createSanitizedSchema<T extends z.ZodType>(schema: T) {
  return schema.transform((data) => sanitizeObject(data));
}