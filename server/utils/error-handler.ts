/**
 * Centralized Error Handling Utilities
 */

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: any) {
    super(`External service error: ${service}`, 503, true, originalError);
  }
}

// Async error wrapper for Express routes
export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Enhanced error logging
export function logError(error: any, context?: string): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    message: error.message || "Unknown error",
    stack: error.stack,
    statusCode: error.statusCode || 500,
    details: error.details,
  };

  if (error.isOperational) {
    console.warn("⚠️  Operational Error:", JSON.stringify(errorInfo, null, 2));
  } else {
    console.error("❌ System Error:", JSON.stringify(errorInfo, null, 2));
  }
}

// Format error response
export function formatErrorResponse(error: any): { message: string; details?: any } {
  if (process.env.NODE_ENV === "production") {
    // In production, hide sensitive error details
    if (error.isOperational) {
      return {
        message: error.message,
        details: error.details,
      };
    }
    return {
      message: "An error occurred. Please try again later.",
    };
  }

  // In development, return full error details
  return {
    message: error.message || "Unknown error",
    details: {
      stack: error.stack,
      statusCode: error.statusCode,
      originalError: error.details,
    },
  };
}