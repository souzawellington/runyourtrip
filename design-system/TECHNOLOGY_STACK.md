# RUN YOUR TRIP - Technology Stack Documentation

## 🚀 Complete Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18.3.1** - Latest React with concurrent features
- **TypeScript 5.7.2** - Type-safe JavaScript
- **Vite 6.0.6** - Lightning-fast build tool

#### UI Component Libraries
```json
{
  "@radix-ui/react-accordion": "^1.2.2",
  "@radix-ui/react-alert-dialog": "^1.1.4", 
  "@radix-ui/react-aspect-ratio": "^1.1.1",
  "@radix-ui/react-avatar": "^1.1.2",
  "@radix-ui/react-checkbox": "^1.1.3",
  "@radix-ui/react-collapsible": "^1.1.2",
  "@radix-ui/react-context-menu": "^2.2.4",
  "@radix-ui/react-dialog": "^1.1.4",
  "@radix-ui/react-dropdown-menu": "^2.1.4",
  "@radix-ui/react-hover-card": "^1.1.4",
  "@radix-ui/react-label": "^2.1.1",
  "@radix-ui/react-menubar": "^1.1.4",
  "@radix-ui/react-navigation-menu": "^1.2.3",
  "@radix-ui/react-popover": "^1.1.4",
  "@radix-ui/react-progress": "^1.1.1",
  "@radix-ui/react-radio-group": "^1.2.2",
  "@radix-ui/react-scroll-area": "^1.2.2",
  "@radix-ui/react-select": "^2.1.4",
  "@radix-ui/react-separator": "^1.1.1",
  "@radix-ui/react-slider": "^1.2.2",
  "@radix-ui/react-slot": "^1.1.1",
  "@radix-ui/react-switch": "^1.1.2",
  "@radix-ui/react-tabs": "^1.1.2",
  "@radix-ui/react-toast": "^1.2.4",
  "@radix-ui/react-toggle": "^1.1.1",
  "@radix-ui/react-toggle-group": "^1.1.1",
  "@radix-ui/react-tooltip": "^1.1.6"
}
```

#### Styling & CSS
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **tailwindcss-animate 1.0.7** - Animation utilities
- **@tailwindcss/typography** - Typography plugin
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefix automation

#### State Management & Data Fetching
- **@tanstack/react-query 5.65.1** - Server state management
- **React Context API** - Built-in state management
- **Zustand** (potential) - Client state management

#### Forms & Validation
- **react-hook-form 7.54.2** - Form state management
- **@hookform/resolvers 3.9.1** - Validation resolvers
- **zod 3.24.1** - Schema validation
- **zod-validation-error 3.4.0** - Error formatting

#### Routing
- **wouter 3.5.0** - Lightweight routing solution

#### Animation & Motion
- **framer-motion 11.15.0** - Production-ready animation library
- **embla-carousel-react 8.5.2** - Carousel component
- **tw-animate-css 0.0.2** - CSS animations

#### Icons & Visual Assets
- **lucide-react 0.468.0** - Icon library
- **react-icons 5.4.0** - Popular icon packs

#### Date & Time
- **date-fns 4.1.0** - Date utility library
- **react-day-picker 9.5.1** - Date picker component

#### Charts & Data Visualization
- **recharts 2.15.0** - Chart library

#### UI Utilities
- **class-variance-authority 0.7.1** - Component variants
- **clsx 2.1.1** - Class name utility
- **tailwind-merge 2.6.0** - Tailwind class merging
- **cmdk 1.0.4** - Command menu
- **input-otp 1.4.1** - OTP input
- **react-resizable-panels 2.1.7** - Resizable panels
- **vaul 1.1.2** - Drawer component

### Backend Technologies

#### Runtime & Framework
- **Node.js 20.19.3** - JavaScript runtime
- **Express 4.21.2** - Web framework
- **TypeScript** - Type safety

#### Database & ORM
- **PostgreSQL** - Primary database
- **@neondatabase/serverless 0.10.4** - Neon database client
- **drizzle-orm 0.38.3** - TypeScript ORM
- **drizzle-kit 0.29.2** - Database migrations
- **drizzle-zod 0.5.2** - Schema validation

#### Authentication & Security
- **passport 0.7.0** - Authentication middleware
- **passport-local 1.0.0** - Local strategy
- **openid-client 6.1.8** - OpenID Connect
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.2** - JWT tokens
- **helmet 8.0.0** - Security headers
- **cors 2.8.5** - CORS handling
- **xss-clean 0.1.4** - XSS protection
- **express-rate-limit 7.5.0** - Rate limiting

#### Session Management
- **express-session 1.18.1** - Session middleware
- **connect-pg-simple 10.0.0** - PostgreSQL session store
- **memorystore 1.6.7** - Memory session store

#### AI & External Services
- **openai 4.77.0** - OpenAI API
- **@google/genai** - Google Gemini AI
- **stripe 17.5.0** - Payment processing
- **@sendgrid/mail 8.1.4** - Email service

#### Utilities
- **winston 3.17.0** - Logging
- **express-winston 4.2.0** - HTTP request logging
- **compression 1.7.5** - Response compression
- **archiver 7.0.1** - File archiving
- **ws 8.18.0** - WebSocket support
- **memoizee 0.4.17** - Function memoization

#### Development Tools
- **tsx 4.19.2** - TypeScript execution
- **esbuild 0.24.0** - JavaScript bundler
- **@vitejs/plugin-react 4.3.4** - Vite React plugin
- **@replit/vite-plugin-cartographer** - Replit integration
- **@replit/vite-plugin-runtime-error-modal** - Error handling

### Theme & Design System

#### Color Palette
- **Primary**: Blue (#0e7df7)
- **Secondary**: Purple (#9c5cd4)
- **Accent**: Gold (#f5b800)
- **Success**: Green (#16a34a)
- **Danger**: Red (#ef4444)

#### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Font Sizes**: 0.75rem to 3.75rem
- **Font Weights**: 300 to 700

#### Spacing Scale
- Based on 4px grid system
- Ranges from 4px (xs) to 64px (3xl)

#### Border Radius
- Default: 0.5rem
- Small: 0.25rem
- Large: 0.75rem
- Full: 9999px (pills)

### Performance Optimizations

#### Build Optimizations
- Code splitting
- Tree shaking
- Minification
- Compression (Gzip/Brotli)

#### Runtime Optimizations
- React.lazy() for code splitting
- React.memo() for component memoization
- useMemo() and useCallback() hooks
- Virtual scrolling for large lists
- Image lazy loading

#### Caching Strategies
- Browser caching headers
- Service worker caching
- React Query cache management
- CDN caching

### Development Environment

#### Package Managers
- npm (Node Package Manager)
- npx for package execution

#### Version Control
- Git for source control
- GitHub for repository hosting

#### Deployment Platform
- Replit for development and hosting
- Environment variables management
- Automatic HTTPS
- WebSocket support

### API Architecture

#### RESTful Endpoints
- Template management
- Project workflows
- Analytics tracking
- User authentication
- Payment processing

#### Real-time Features
- WebSocket connections
- Live updates
- Progress tracking

### Security Features

#### Authentication
- JWT tokens
- Session management
- Role-based access control
- Rate limiting

#### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

### Performance Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Largest Contentful Paint: < 2.5s

### Monitoring & Analytics
- Winston logging
- Performance monitoring
- Error tracking
- User analytics
- Business metrics

---

## NPM Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run check && vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "check": "tsc --noEmit",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Environment Variables

```env
# Database
DATABASE_URL=

# Authentication
SESSION_SECRET=
ADMIN_JWT_SECRET=
ADMIN_PASSWORD=

# Replit
REPLIT_DOMAINS=
REPL_ID=
ISSUER_URL=

# AI Services
OPENAI_API_KEY=
GEMINI_API_KEY=
PERPLEXITY_API_KEY=

# Payment
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=
```

---

*This technology stack represents a modern, scalable, and secure web application architecture optimized for AI-powered template generation and marketplace functionality.*