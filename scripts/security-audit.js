#!/usr/bin/env node

/**
 * Security Audit Script
 * Runs various security checks on the project
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log functions
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(50)}${colors.reset}`),
};

// Execute command and return promise
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// Check for npm audit vulnerabilities
async function checkNpmAudit() {
  log.header('NPM Security Audit');
  
  try {
    const { stdout } = await execCommand('npm audit --json');
    const auditResult = JSON.parse(stdout);
    
    const vulnerabilities = auditResult.metadata.vulnerabilities;
    const total = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      log.success('No vulnerabilities found!');
    } else {
      log.warning(`Found ${total} vulnerabilities:`);
      log.info(`  Critical: ${vulnerabilities.critical || 0}`);
      log.info(`  High: ${vulnerabilities.high || 0}`);
      log.info(`  Moderate: ${vulnerabilities.moderate || 0}`);
      log.info(`  Low: ${vulnerabilities.low || 0}`);
      
      // Attempt to fix automatically
      log.info('Attempting to fix vulnerabilities...');
      try {
        await execCommand('npm audit fix');
        log.success('Some vulnerabilities fixed automatically');
      } catch (e) {
        log.warning('Could not automatically fix all vulnerabilities');
        log.info('Run "npm audit fix --force" to fix breaking changes (use with caution)');
      }
    }
    
    return total;
  } catch (error) {
    log.error('Failed to run npm audit');
    console.error(error.stderr);
    return -1;
  }
}

// Check for outdated dependencies
async function checkOutdatedDeps() {
  log.header('Outdated Dependencies Check');
  
  try {
    const { stdout } = await execCommand('npm outdated --json');
    const outdated = stdout ? JSON.parse(stdout) : {};
    const outdatedCount = Object.keys(outdated).length;
    
    if (outdatedCount === 0) {
      log.success('All dependencies are up to date!');
    } else {
      log.warning(`Found ${outdatedCount} outdated dependencies:`);
      
      const criticalPackages = [
        'express', 'helmet', 'cors', 'jsonwebtoken', 
        'bcryptjs', 'express-rate-limit', 'drizzle-orm',
        'vite', '@vitejs/plugin-react'
      ];
      
      Object.entries(outdated).forEach(([pkg, info]) => {
        const isCritical = criticalPackages.includes(pkg);
        const prefix = isCritical ? `${colors.red}[CRITICAL]${colors.reset}` : '';
        log.info(`  ${prefix} ${pkg}: ${info.current} → ${info.latest}`);
      });
      
      log.info('\nRun "npm update" to update dependencies');
    }
    
    return outdatedCount;
  } catch (error) {
    // No outdated packages returns empty output
    log.success('All dependencies are up to date!');
    return 0;
  }
}

// Check for known vulnerable patterns in code
async function checkCodePatterns() {
  log.header('Code Security Patterns Check');
  
  const vulnerablePatterns = [
    {
      name: 'Hardcoded Secrets',
      patterns: [
        /api[_-]?key\s*=\s*["'][^"']{20,}/gi,
        /secret\s*=\s*["'][^"']{10,}/gi,
        /password\s*=\s*["'][^"']+/gi,
        /token\s*=\s*["'][^"']{20,}/gi,
      ],
      exclude: ['node_modules', '.env.example', 'package-lock.json'],
    },
    {
      name: 'SQL Injection',
      patterns: [
        /query\([`"'].*\$\{.*\}.*[`"']\)/g,
        /query\([`"'].*\+.*[`"']\)/g,
      ],
      exclude: ['node_modules'],
    },
    {
      name: 'Unsafe Eval',
      patterns: [
        /eval\s*\(/g,
        /new\s+Function\s*\(/g,
      ],
      exclude: ['node_modules', 'dist'],
    },
  ];
  
  let issuesFound = 0;
  
  for (const check of vulnerablePatterns) {
    log.info(`Checking for ${check.name}...`);
    
    const files = await findFiles('.', ['.ts', '.tsx', '.js', '.jsx'], check.exclude);
    let found = false;
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      for (const pattern of check.patterns) {
        const matches = content.match(pattern);
        if (matches) {
          found = true;
          issuesFound++;
          log.warning(`  Found in ${file}`);
          break;
        }
      }
    }
    
    if (!found) {
      log.success(`  No ${check.name} issues found`);
    }
  }
  
  return issuesFound;
}

// Find files recursively
function findFiles(dir, extensions, exclude = []) {
  const files = [];
  
  function walk(directory) {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      
      // Skip excluded paths
      if (exclude.some(ex => fullPath.includes(ex))) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Check environment variables
function checkEnvironmentVars() {
  log.header('Environment Variables Check');
  
  const requiredVars = [
    'DATABASE_URL',
    'SESSION_SECRET',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
  ];
  
  const recommendedVars = [
    'ADMIN_JWT_SECRET',
    'STRIPE_WEBHOOK_SECRET',
    'GEMINI_API_KEY',
    'PERPLEXITY_API_KEY',
  ];
  
  let missing = 0;
  
  log.info('Checking required environment variables...');
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      log.error(`  Missing: ${varName}`);
      missing++;
    } else {
      log.success(`  Found: ${varName}`);
    }
  }
  
  log.info('\nChecking recommended environment variables...');
  for (const varName of recommendedVars) {
    if (!process.env[varName]) {
      log.warning(`  Missing (optional): ${varName}`);
    } else {
      log.success(`  Found: ${varName}`);
    }
  }
  
  return missing;
}

// Check file permissions
function checkFilePermissions() {
  log.header('File Permissions Check');
  
  const sensitivePaths = [
    '.env',
    'server/env-validation.ts',
    'logs',
  ];
  
  let issues = 0;
  
  for (const filepath of sensitivePaths) {
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      const mode = (stats.mode & parseInt('777', 8)).toString(8);
      
      if (mode === '777' || mode === '666') {
        log.warning(`  ${filepath} has overly permissive permissions: ${mode}`);
        issues++;
      } else {
        log.success(`  ${filepath} permissions OK: ${mode}`);
      }
    }
  }
  
  return issues;
}

// Main execution
async function main() {
  log.header('🔒 RUN YOUR TRIP Security Audit 🔒');
  log.info(`Running security audit at ${new Date().toISOString()}\n`);
  
  const results = {
    npmVulnerabilities: await checkNpmAudit(),
    outdatedDeps: await checkOutdatedDeps(),
    codePatterns: await checkCodePatterns(),
    envVars: checkEnvironmentVars(),
    filePermissions: checkFilePermissions(),
  };
  
  log.header('Audit Summary');
  
  const hasIssues = Object.values(results).some(v => v > 0);
  
  if (!hasIssues) {
    log.success('✅ All security checks passed!');
  } else {
    log.warning('⚠️ Security issues detected:');
    
    if (results.npmVulnerabilities > 0) {
      log.error(`  - ${results.npmVulnerabilities} npm vulnerabilities`);
    }
    if (results.outdatedDeps > 0) {
      log.warning(`  - ${results.outdatedDeps} outdated dependencies`);
    }
    if (results.codePatterns > 0) {
      log.error(`  - ${results.codePatterns} code pattern issues`);
    }
    if (results.envVars > 0) {
      log.error(`  - ${results.envVars} missing environment variables`);
    }
    if (results.filePermissions > 0) {
      log.warning(`  - ${results.filePermissions} file permission issues`);
    }
    
    log.info('\nRecommended actions:');
    log.info('1. Run "npm audit fix" to fix vulnerabilities');
    log.info('2. Update critical dependencies');
    log.info('3. Review and fix code pattern issues');
    log.info('4. Set missing environment variables');
    log.info('5. Fix file permissions where needed');
  }
  
  // Exit with error code if critical issues found
  const criticalIssues = results.npmVulnerabilities > 0 || 
                        results.codePatterns > 0 || 
                        results.envVars > 0;
  
  process.exit(criticalIssues ? 1 : 0);
}

// Run the audit
main().catch(error => {
  log.error('Audit failed with error:');
  console.error(error);
  process.exit(1);
});