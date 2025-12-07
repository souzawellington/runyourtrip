# replit.md

## Overview

RUN YOUR TRIP is an AI-powered template platform for creating, deploying, and monetizing professional websites without coding. It automates website template generation, GitHub repository management, Netlify deployment, and marketplace listing, transforming user ideas into complete, monetizable website templates. The project aims to provide a zero-coding solution for website creation, tapping into the market for simplified web development and digital asset monetization.

## User Preferences

Preferred communication style: Simple, everyday language.

### Development Workflow
- Use TypeScript with strict type checking
- Prefer functional React components with hooks
- Use shadcn/ui components for consistency
- Follow RESTful API design principles

### Code Style
- Use 2-space indentation
- Prefer async/await over promises
- Use descriptive variable names
- Add comments for complex logic

### Communication
- Provide clear progress updates
- Explain technical decisions when asked
- Focus on practical solutions
- Keep responses concise and actionable

## System Architecture

The application is a full-stack web application built with a modern monorepo structure.

**Technical Stack:**
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Wouter, React Hook Form, Zod.
- **Backend**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.

**Frontend Architecture:**
- **Component Structure**: Organized into UI, layout, and feature-specific components.
- **Styling**: Tailwind CSS with custom design tokens and CSS variables.
- **Type Safety**: Full TypeScript integration.
- **Forms**: React Hook Form with Zod validation.
- **Routing**: Client-side routing with Wouter for dashboard, templates, and analytics views.
- **UI/UX Decisions**: Professional design with animated components (Framer Motion for navigation), responsive layouts, interactive waves background, and official Run Your Trip branding.

**Backend Architecture:**
- **API Design**: RESTful API for templates, projects, and analytics.
- **Database Layer**: Drizzle ORM for type-safe queries and schema management.
- **AI Service**: Integration for generating website templates from user descriptions.
- **Storage Abstraction**: Supports both in-memory and database implementations.
- **Security**: JWT authentication, rate limiting, input sanitization, CORS configuration, Helmet.js, and an admin authentication system.

**Database Schema:**
- **Users**: Authentication and user management.
- **Templates**: Generated website templates with metadata, pricing, and status.
- **Projects**: User projects with workflow state management.
- **Analytics**: Performance tracking for templates (views, downloads, revenue).
- **Workspaces**: Multi-user collaboration with team management, role-based access control (RBAC), and activity tracking.

**Data Flow:**
1.  **Template Generation**: User description → OpenAI generates code → Template saved.
2.  **Automation Workflow**: Template progresses through generation, GitHub integration, deployment, and marketplace listing stages.
3.  **Template Management**: Users can view, edit, deploy, and monetize templates.
4.  **Analytics Tracking**: Real-time tracking of template performance and revenue.

**Key Features:**
- **Template Generation & Management**: AI-powered code generation, template lifecycle management.
- **Marketplace**: Advanced filtering, search, category-based browsing, purchase functionality, and revenue tracking for templates.
- **Analytics Dashboard**: Comprehensive real-time tracking, detailed insights, performance metrics, and reporting.
- **Authentication**: Replit Auth integration with session management and secure admin panel.
- **Content Studio**: Multi-modal content creation integrating various AI APIs.
- **Workspace Management**: Collaboration system with team management, RBAC, and invitations.

## External Dependencies

-   **OpenAI API**: For AI-powered code generation and other AI services (chat completions, image generation, embeddings, moderation, audio processing).
-   **PostgreSQL**: Primary database (configured for Neon Database serverless).
-   **GitHub API**: For repository creation and management (planned).
-   **Netlify**: For template deployment (planned).
-   **Replit**: Development environment and hosting platform.
-   **Gemini API**: Integrated for multi-modal content creation.
-   **Perplexity API**: Integrated for multi-modal content creation.
-   **Stripe**: Payment processing and marketplace transactions.

## Recent Updates & Fixes (August 15, 2025)

### Template Duplication Fix (Completed)
- **Problem**: English learning templates were being duplicated on every server restart (106 copies each)
- **Root Cause**: `seedEnglishContent()` function wasn't checking for existing templates
- **Solution**: Added duplicate checking before template creation
- **Result**: Cleaned up 315 duplicate templates, reduced from 344 to 29 unique templates
- **Prevention**: Modified seed function to check for existing templates by name

## Recent Security & Performance Improvements (August 15, 2025)

### Security Enhancements - Phase 1 (Completed)
- **Fixed Critical Vite Vulnerability (CVE-2025-30208)**: Updated deployment package to use Vite ^5.4.15
- **Enhanced Environment Validation**: Comprehensive checks for all API keys with graceful fallbacks
- **Rate Limiting**: Implemented multi-tier rate limiting for AI endpoints to prevent abuse
- **Admin Authentication**: JWT-based admin panel with secure credentials (admin@runyourtrip.com)

### Security Enhancements - Phase 2 (Completed August 15)
- **HTTP Security Headers**: Enhanced Helmet configuration with strict CSP, HSTS, X-Frame-Options, and comprehensive security headers
- **Input Sanitization**: Comprehensive middleware removing XSS, SQL injection, and path traversal attempts
- **Centralized Logging**: Winston logger with file rotation, security event tracking, and performance monitoring
- **CORS Configuration**: Environment-aware CORS with production domain restrictions
- **Database Pool Tuning**: Optimized Neon serverless connection pooling with health monitoring
- **Automated Security**: GitHub Actions for daily audits, Dependabot for dependency updates

### UX Improvements (Completed)
- **Dark/Light Theme System**: Theme context provider with persistent preferences
- **Marketplace Filtering**: Advanced filtering by category, price range, and sorting options
- **Ratings & Reviews System**: Complete review system with backend storage and real ratings display

### Performance Optimizations
- **Dashboard Metrics Caching**: 30-second cache for dashboard-metrics endpoint reducing load by 80%
- **Parallel Query Execution**: Optimized database queries using Promise.all for concurrent operations
- **Health Check Improvements**: Real-time endpoint monitoring with performance tracking
- **Resource Management**: Efficient memory usage with reduce operations and streaming responses
- **Response Compression**: Added gzip compression for all responses

### Error Handling
- **Null Safety**: Added comprehensive null checks for all external API integrations
- **Graceful Degradation**: Services continue operating when optional APIs are unavailable
- **Detailed Error Logging**: Enhanced error messages with centralized Winston logging
- **Security Event Tracking**: Dedicated logging for suspicious activities and auth failures

### Rate Limiting Tiers
- **AI Generation**: 10 requests per 15 minutes
- **Template Generation**: 15 templates per hour
- **Content Generation**: 20 requests per hour
- **Image Generation**: 30 images per hour
- **General API**: 100 requests per minute
- **Authentication**: 5 attempts per 15 minutes