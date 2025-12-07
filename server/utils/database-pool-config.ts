import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { logger } from './centralized-logger';

// Configure Neon database connection pooling
export function configureDatabasePool() {
  // Set connection pool configuration
  neonConfig.poolQueryViaFetch = true; // Use HTTP for queries
  neonConfig.fetchConnectionCache = true; // Cache connections
  
  // Pool configuration based on environment
  const poolConfig = {
    // Maximum number of clients in the pool
    max: process.env.NODE_ENV === 'production' ? 20 : 10,
    
    // Minimum number of clients in the pool
    min: process.env.NODE_ENV === 'production' ? 5 : 2,
    
    // Number of milliseconds a client must sit idle before being closed
    idleTimeoutMillis: process.env.NODE_ENV === 'production' ? 30000 : 60000,
    
    // Number of milliseconds to wait before timing out when connecting
    connectionTimeoutMillis: 5000,
    
    // Maximum number of uses for a single connection
    maxUses: 7500,
    
    // Automatically remove idle clients
    allowExitOnIdle: true,
  };
  
  logger.info('Database pool configured', {
    environment: process.env.NODE_ENV,
    poolConfig,
  });
  
  return poolConfig;
}

// Monitor pool health
export function monitorPoolHealth(pool: any) {
  const checkInterval = 60000; // Check every minute
  
  setInterval(() => {
    const stats = {
      total: pool.totalCount || 0,
      idle: pool.idleCount || 0,
      waiting: pool.waitingCount || 0,
    };
    
    // Log pool statistics
    logger.debug('Database pool statistics', stats);
    
    // Alert if pool is saturated
    if (stats.waiting > 5) {
      logger.warn('Database pool saturation detected', {
        ...stats,
        alert: 'High number of waiting connections',
      });
    }
    
    // Alert if too many idle connections
    if (stats.idle > stats.total * 0.7) {
      logger.debug('Database pool has many idle connections', {
        ...stats,
        suggestion: 'Consider reducing pool size',
      });
    }
  }, checkInterval);
}

// Optimize query performance
export const queryOptimizations = {
  // Add query timeout
  defaultTimeout: 10000, // 10 seconds
  
  // Enable query caching for read operations
  enableCache: true,
  cacheTimeout: 300000, // 5 minutes
  
  // Connection retry logic
  retryOptions: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 5000,
    randomize: true,
  },
  
  // Query batching for bulk operations
  batchSize: 100,
  
  // Enable prepared statements for frequently used queries
  preparedStatements: true,
};

// Database maintenance tasks
export const databaseMaintenance = {
  // Vacuum settings (for PostgreSQL)
  vacuum: {
    enabled: true,
    schedule: '0 3 * * *', // Daily at 3 AM
    tables: ['templates', 'analytics', 'users', 'projects'],
  },
  
  // Index maintenance
  reindex: {
    enabled: true,
    schedule: '0 4 * * 0', // Weekly on Sunday at 4 AM
  },
  
  // Statistics update
  analyze: {
    enabled: true,
    schedule: '0 */6 * * *', // Every 6 hours
  },
  
  // Connection cleanup
  cleanupIdleConnections: {
    enabled: true,
    maxIdleTime: 300000, // 5 minutes
    checkInterval: 60000, // Check every minute
  },
};

// Connection error handler
export function handleConnectionError(error: any) {
  logger.error('Database connection error', {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });
  
  // Specific error handling
  switch (error.code) {
    case 'PROTOCOL_CONNECTION_LOST':
      logger.info('Database connection lost, attempting to reconnect...');
      break;
    case 'ER_CON_COUNT_ERROR':
      logger.error('Database has too many connections');
      break;
    case 'ECONNREFUSED':
      logger.error('Database connection refused');
      break;
    default:
      logger.error('Unknown database error', { code: error.code });
  }
}

export default {
  configureDatabasePool,
  monitorPoolHealth,
  queryOptimizations,
  databaseMaintenance,
  handleConnectionError,
};