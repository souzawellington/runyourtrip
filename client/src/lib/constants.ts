export const BRAND_CONFIG = {
  name: "RUN YOUR TRIP",
  tagline: "AI Template Platform",
  description: "Create, deploy, and monetize professional websites with zero coding. From idea to income in minutes.",
  colors: {
    primary: "#0070F3",
    secondary: "#7C3AED", 
    success: "#10B981",
    accent: "#F59E0B",
    bgLight: "#FAFAFA",
    textDark: "#1A202C"
  }
};

export const TEMPLATE_CATEGORIES = [
  "Portfolio",
  "Business", 
  "E-commerce",
  "Blog",
  "Landing Page",
  "Travel",
  "Photography",
  "SaaS"
] as const;

export const PRICE_RANGES = [
  "$29 - $49",
  "$49 - $99", 
  "$99 - $199",
  "$199+"
] as const;

export const WORKFLOW_STEPS = [
  {
    id: 1,
    name: "AI Code Generation",
    description: "Template generated with React + Tailwind CSS",
    icon: "fas fa-magic"
  },
  {
    id: 2,
    name: "GitHub Repository", 
    description: "Pushing code to version control...",
    icon: "fas fa-upload"
  },
  {
    id: 3,
    name: "Netlify Deployment",
    description: "Deploy to production environment",
    icon: "fas fa-rocket"
  },
  {
    id: 4,
    name: "Stan.store Listing",
    description: "Create marketplace product listing",
    icon: "fas fa-store"
  }
] as const;
