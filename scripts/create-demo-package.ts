#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';

const DEMO_PACKAGE_DIR = 'ryt-demo-package';
const EXCLUDED_ITEMS = [
  'node_modules',
  '.git',
  '.env',
  '.env.local',
  '.env.production',
  'dist',
  'build',
  'logs',
  '*.log',
  '.DS_Store',
  'thumbs.db',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.replit',
  '.cache',
  '.vite',
  'ryt-demo-package',
  '*.zip',
  'scripts/create-demo-package.ts'
];

const DIRECTORIES_TO_COPY = [
  'client',
  'server',
  'shared',
  'scripts',
];

const ROOT_FILES_TO_COPY = [
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'components.json',
  'replit.md',
  'CONTENT_STUDIO_GUIDE.md',
  'SECURITY_IMPLEMENTATION.md',
  'STRIPE_PAYMENT_LINKS_SETUP.md'
];

function shouldExclude(itemPath: string): boolean {
  const basename = path.basename(itemPath);
  return EXCLUDED_ITEMS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(basename);
    }
    return basename === pattern || itemPath.includes(pattern);
  });
}

function copyDirectory(src: string, dest: string, baseDir: string = src) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);
  
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (shouldExclude(srcPath)) {
      continue;
    }
    
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath, baseDir);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function createDemoPackage() {
  console.log('🚀 Creating RunYourTrip demo package...\n');
  
  // Clean up previous demo package
  if (fs.existsSync(DEMO_PACKAGE_DIR)) {
    console.log('🧹 Cleaning up previous demo package...');
    fs.rmSync(DEMO_PACKAGE_DIR, { recursive: true, force: true });
  }
  
  // Create demo package directory
  fs.mkdirSync(DEMO_PACKAGE_DIR, { recursive: true });
  
  // Copy directories
  console.log('📁 Copying project directories...');
  for (const dir of DIRECTORIES_TO_COPY) {
    if (fs.existsSync(dir)) {
      const destDir = path.join(DEMO_PACKAGE_DIR, dir);
      console.log(`   ✓ Copying ${dir}/`);
      copyDirectory(dir, destDir);
    }
  }
  
  // Copy root files
  console.log('\n📄 Copying configuration files...');
  for (const file of ROOT_FILES_TO_COPY) {
    if (fs.existsSync(file)) {
      console.log(`   ✓ Copying ${file}`);
      fs.copyFileSync(file, path.join(DEMO_PACKAGE_DIR, file));
    }
  }
  
  // Create example environment file
  console.log('\n🔐 Creating example environment file...');
  const envExample = `# RunYourTrip Environment Variables
# Copy this file to .env and fill in your values

# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Session Configuration
SESSION_SECRET=your-session-secret-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Gemini Configuration
GEMINI_API_KEY=your-gemini-api-key

# Perplexity Configuration
PERPLEXITY_API_KEY=your-perplexity-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk-test-your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec-your-webhook-secret

# Admin Configuration
ADMIN_JWT_SECRET=your-admin-jwt-secret

# SendGrid Configuration (optional)
SENDGRID_API_KEY=your-sendgrid-api-key

# Replit Environment (automatically set in Replit)
# REPLIT_DOMAINS=
# REPL_ID=

# Authentication Provider
ISSUER_URL=https://replit.com
`;
  
  fs.writeFileSync(path.join(DEMO_PACKAGE_DIR, '.env.example'), envExample);
  console.log('   ✓ Created .env.example');
  
  // Create demo README
  console.log('\n📝 Creating demo README...');
  const readme = `# RunYourTrip Platform - Demo Package

## Overview
RunYourTrip is an AI-powered template platform for creating, deploying, and monetizing professional websites without coding. This demo package contains the complete source code for evaluation purposes.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, TypeScript, PostgreSQL, Drizzle ORM
- **AI Integration**: OpenAI, Gemini, Perplexity APIs
- **Payment**: Stripe (Connect, Subscriptions, Marketplace)
- **Authentication**: Replit Auth / JWT

## Key Features
- AI-powered website template generation
- Marketplace with ratings, reviews, and recommendations
- Multi-tier subscription system
- Referral program with rewards
- Content Studio for multi-modal AI content creation
- Workspace collaboration with RBAC
- Analytics dashboard with real-time metrics
- Admin panel for platform management

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- API keys for OpenAI, Gemini, Perplexity, and Stripe

### Installation Steps

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure environment**:
   - Copy \`.env.example\` to \`.env\`
   - Fill in all required API keys and database credentials

3. **Set up database**:
   \`\`\`bash
   npm run db:push
   \`\`\`

4. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access the application**:
   - Open http://localhost:5000 in your browser
   - Default admin: admin@runyourtrip.com

## Project Structure

\`\`\`
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and helpers
│   │   └── contexts/     # React contexts
│   └── public/           # Static assets
│
├── server/           # Express backend application
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── tasks/            # Background tasks
│   └── index.ts          # Server entry point
│
├── shared/           # Shared types and schemas
│   └── schema.ts         # Database schema (Drizzle)
│
└── scripts/          # Utility scripts
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run db:push\` - Push schema changes to database
- \`npm run db:studio\` - Open Drizzle Studio
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript type checking

## Security Features
- JWT-based authentication
- Rate limiting on all API endpoints
- Input sanitization and validation
- CORS configuration
- Helmet.js security headers
- Environment variable validation

## Performance Optimizations
- Dashboard metrics caching (30-second TTL)
- Parallel database query execution
- Response compression (gzip)
- Optimized connection pooling
- Real-time health monitoring

## Contact & Support
For questions about this demo or to discuss implementation:
- Website: https://runyourtrip.com
- Email: support@runyourtrip.com

## License
This demo package is provided for evaluation purposes only.
All rights reserved - RunYourTrip © 2025
`;
  
  fs.writeFileSync(path.join(DEMO_PACKAGE_DIR, 'README.md'), readme);
  console.log('   ✓ Created README.md');
  
  // Create sample data file
  console.log('\n💾 Creating sample data file...');
  const sampleData = `-- Sample Data for RunYourTrip Demo
-- This file contains sample SQL to populate the database with demo data

-- Sample categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Travel Blog', 'travel-blog', 'Beautiful travel blog templates', 'MapPin', 1),
('Tour Agency', 'tour-agency', 'Professional tour agency websites', 'Globe', 2),
('Booking Platform', 'booking-platform', 'Complete booking solutions', 'ShoppingCart', 3),
('Hotel Website', 'hotel-website', 'Elegant hotel and resort templates', 'Building', 4);

-- Sample user
INSERT INTO users (id, email, first_name, last_name) VALUES
('demo-user', 'demo@runyourtrip.com', 'Demo', 'User');

-- Note: Run the application to automatically seed templates and other data
`;
  
  fs.writeFileSync(path.join(DEMO_PACKAGE_DIR, 'sample-data.sql'), sampleData);
  console.log('   ✓ Created sample-data.sql');
  
  // Create ZIP archive
  console.log('\n📦 Creating ZIP archive...');
  const output = fs.createWriteStream('runyourtrip-demo.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });
  
  return new Promise((resolve, reject) => {
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`   ✓ Archive created: runyourtrip-demo.zip (${sizeInMB} MB)`);
      
      // Clean up temporary directory
      console.log('\n🧹 Cleaning up temporary files...');
      fs.rmSync(DEMO_PACKAGE_DIR, { recursive: true, force: true });
      
      console.log('\n✅ Demo package created successfully!');
      console.log('📍 Location: runyourtrip-demo.zip');
      console.log('\n📋 Package includes:');
      console.log('   • Complete source code (frontend & backend)');
      console.log('   • Database schema and migrations');
      console.log('   • Configuration templates');
      console.log('   • Documentation and setup guides');
      console.log('   • Sample data for testing');
      console.log('\n⚠️  Excluded from package:');
      console.log('   • API keys and secrets');
      console.log('   • Database credentials');
      console.log('   • Node modules');
      console.log('   • Build artifacts');
      console.log('   • Log files');
      
      resolve(true);
    });
    
    archive.on('error', (err) => {
      console.error('❌ Error creating archive:', err);
      reject(err);
    });
    
    archive.pipe(output);
    archive.directory(DEMO_PACKAGE_DIR, false);
    archive.finalize();
  });
}

// Run the script
createDemoPackage().catch(console.error);