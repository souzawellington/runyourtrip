import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Rate limiter for AI generation endpoints
export const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many AI generation requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: "Too many requests",
      message: "You have exceeded the rate limit for AI generation. Please wait 15 minutes before trying again.",
      retryAfter: 900 // seconds
    });
  },
  skip: (req: any) => {
    // Skip rate limiting for admin users
    return req.user?.role === "admin" || req.user?.role === "super_admin";
  }
});

// Rate limiter for content generation
export const contentGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour
  message: "Too many content generation requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for template generation
export const templateGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour  
  max: 15, // Limit each IP to 15 template generations per hour
  message: "Too many template generation requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for image generation
export const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 image generations per hour
  message: "Too many image generation requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});