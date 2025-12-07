/**
 * Environment Variable Validation
 * Ensures all required environment variables are set on startup
 */

interface RequiredEnvVar {
  name: string;
  description: string;
  required: boolean;
  sensitive?: boolean;
}

const ENV_VARS: RequiredEnvVar[] = [
  {
    name: "DATABASE_URL",
    description: "PostgreSQL connection string",
    required: true,
    sensitive: true,
  },
  {
    name: "SESSION_SECRET",
    description: "Secret key for signing session cookies",
    required: true,
    sensitive: true,
  },
  {
    name: "REPLIT_DOMAINS",
    description: "Comma-separated list of Replit domains",
    required: true,
  },
  {
    name: "REPL_ID",
    description: "Replit instance ID",
    required: true,
  },
  {
    name: "OPENAI_API_KEY",
    description: "OpenAI API key for AI features",
    required: false,
    sensitive: true,
  },
  {
    name: "GEMINI_API_KEY",
    description: "Google Gemini API key for content generation",
    required: false,
    sensitive: true,
  },
  {
    name: "PERPLEXITY_API_KEY",
    description: "Perplexity API key for search and trends",
    required: false,
    sensitive: true,
  },
  {
    name: "STRIPE_SECRET_KEY",
    description: "Stripe secret key for payment processing",
    required: false,
    sensitive: true,
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    description: "Stripe webhook endpoint secret",
    required: false,
    sensitive: true,
  },
  {
    name: "ADMIN_JWT_SECRET",
    description: "JWT secret for admin authentication",
    required: false,
    sensitive: true,
  },
  {
    name: "ISSUER_URL",
    description: "OIDC issuer URL (defaults to https://replit.com/oidc)",
    required: false,
  },
];

export function validateEnvironment(): void {
  console.log("🔍 Validating environment variables...");
  
  const missingVars: string[] = [];
  const warnings: string[] = [];
  
  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];
    
    if (!value && envVar.required) {
      missingVars.push(`${envVar.name}: ${envVar.description}`);
    } else if (!value && !envVar.required) {
      warnings.push(`${envVar.name}: ${envVar.description} (optional, some features may not work)`);
    } else if (value && !envVar.sensitive) {
      console.log(`✅ ${envVar.name}: Set`);
    } else if (value && envVar.sensitive) {
      console.log(`✅ ${envVar.name}: Set (hidden)`);
    }
  }
  
  // Check for default/insecure values
  if (process.env.SESSION_SECRET === "your-secret-key-here") {
    warnings.push("SESSION_SECRET is using default value - this is insecure!");
  }
  
  if (process.env.OPENAI_API_KEY === "your-openai-key-here") {
    warnings.push("OPENAI_API_KEY is using placeholder value - AI features will not work!");
  }
  
  if (process.env.ADMIN_PASSWORD === "ChangeMe123!") {
    warnings.push("ADMIN_PASSWORD is using default value - change immediately for security!");
  }
  
  if (process.env.ADMIN_JWT_SECRET === "admin-secret-change-this") {
    warnings.push("ADMIN_JWT_SECRET is using default value - this is insecure!");
  }
  
  // Display results
  if (warnings.length > 0) {
    console.warn("\n⚠️  Warnings:");
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  if (missingVars.length > 0) {
    console.error("\n❌ Missing required environment variables:");
    missingVars.forEach(varInfo => console.error(`   - ${varInfo}`));
    console.error("\nPlease set these environment variables and restart the application.");
    process.exit(1);
  }
  
  console.log("\n✅ Environment validation complete!");
}

// Generate SESSION_SECRET if not set (for development only)
export function generateSessionSecret(): string {
  if (process.env.NODE_ENV === "development" && !process.env.SESSION_SECRET) {
    const crypto = require("crypto");
    const secret = crypto.randomBytes(32).toString("hex");
    console.warn("⚠️  Generated temporary SESSION_SECRET for development. Set a permanent value in production!");
    return secret;
  }
  return process.env.SESSION_SECRET!;
}