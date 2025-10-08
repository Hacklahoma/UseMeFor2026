import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { logger } from './config/logger';
import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './modules/users/user.router';
import { rateLimiter } from './auth/middleware/rateLimit';
import { suspiciousActivity } from './auth/middleware/suspiciousActivity';

export const createApp = async (): Promise<express.Application> => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true
  }));

  // Parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Logging middleware
  if (config.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // Global middleware
  app.use(rateLimiter);
  app.use(suspiciousActivity);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV 
    });
  });

  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  
  // Admin routes (development only)
  if (config.ENABLE_ADMIN_TOOL) {
    const { createAdminRouter } = await import('./admin-tool');
    app.use('/admin', createAdminRouter());
  }

  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
