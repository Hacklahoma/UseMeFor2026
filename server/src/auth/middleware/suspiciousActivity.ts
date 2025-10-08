import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';

// Simple in-memory store for tracking suspicious activity
// TODO: Replace with Redis for production/distributed systems
const ipActivityMap = new Map<string, { count: number; windowStart: number }>();

export const suspiciousActivity = (req: Request, _res: Response, next: NextFunction): void => {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  const windowMs = 60 * 1000; // 1 minute window
  
  // Get or create activity record for this IP
  let activity = ipActivityMap.get(ip);
  
  if (!activity || (now - activity.windowStart) > windowMs) {
    // Reset window
    activity = { count: 0, windowStart: now };
  }
  
  activity.count++;
  ipActivityMap.set(ip, activity);
  
  // Log suspicious activity thresholds
  if (req.path.startsWith('/auth') && activity.count > 10) {
    logger.warn('Suspicious auth activity detected', {
      ip,
      path: req.path,
      count: activity.count,
      userAgent: req.get('User-Agent')
    });
  } else if (activity.count > 50) {
    logger.warn('High request volume from IP', {
      ip,
      path: req.path,
      count: activity.count
    });
  }
  
  next();
};
