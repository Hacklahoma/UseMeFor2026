import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  
  // Database
  MONGODB_URI: process.env.NODE_ENV === 'test' 
    ? process.env.MONGODB_URI_TEST
    : process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI_PROD || process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/hacklahoma2026_dev',
  
  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Session
  SESSION_ISSUER: process.env.SESSION_ISSUER || 'hacklahoma2026',
  SESSION_PRUNE_MINS: parseInt(process.env.SESSION_PRUNE_MINS || '60', 10),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  
  // Development
  ENABLE_DEV_ROUTES: process.env.ENABLE_DEV_ROUTES === 'on',
  ENABLE_ADMIN_TOOL: process.env.ENABLE_ADMIN_TOOL === 'on',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

export default config;
