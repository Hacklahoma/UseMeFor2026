import { Router } from 'express';
import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../config/logger';
import { databaseSeeder } from '../db/seeds/seed-dev';
import { tokenService } from '../auth/tokens';
import User, { UserRole } from '../db/models/User';

// Admin tool router - only available in development
export const createAdminRouter = (): Router => {
  const router = Router();

  // Only enable admin routes in development
  if (!config.ENABLE_ADMIN_TOOL || config.NODE_ENV === 'production') {
    logger.warn('Admin tool is disabled');
    return router;
  }

  // Health check for admin tool
  router.get('/health', (_req, res) => {
    res.json({
      status: 'Admin tool active',
      environment: config.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });

  // Database seeding endpoints
  router.post('/seed-users', async (_req, res) => {
    try {
      const results = await databaseSeeder.seedUsers();
      res.json({
        success: true,
        message: 'User seeding completed',
        results
      });
    } catch (error) {
      logger.error('Seed users failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Seeding failed'
      });
    }
  });

  router.post('/seed-all', async (_req, res) => {
    try {
      const results = await databaseSeeder.seedAll();
      res.json({
        success: true,
        message: 'Full database seeding completed',
        results
      });
    } catch (error) {
      logger.error('Full seeding failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Full seeding failed'
      });
    }
  });

  router.post('/clear-database', async (_req, res) => {
    try {
      const results = await databaseSeeder.clearDatabase();
      res.json({
        success: true,
        message: 'Database cleared successfully',
        results
      });
    } catch (error) {
      logger.error('Clear database failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Database clearing failed'
      });
    }
  });

  router.get('/database-stats', async (_req, res) => {
    try {
      const stats = await databaseSeeder.getDatabaseStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      logger.error('Get database stats failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get database stats'
      });
    }
  });

  router.post('/users', async (req, res) => {
    try {
      const user = await databaseSeeder.createUser(req.body);
      res.json({
        success: true,
        message: 'User created successfully',
        user
      });
    } catch (error) {
      logger.error('Create user failed', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'User creation failed'
      });
    }
  });

  // Update user endpoint
  router.put('/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Don't allow updating password through this endpoint for security
      if (updates.password) {
        delete updates.password;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info(`Updated user: ${user.email}`);
      
      return res.json({
        success: true,
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      logger.error('Update user failed', error);
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'User update failed'
      });
    }
  });

  router.get('/system-info', (_req, res) => {
    try {
      const systemInfo = getSystemInfo();
      res.json({
        success: true,
        systemInfo
      });
    } catch (error) {
      logger.error('Failed to get system info', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system information'
      });
    }
  });

  // User impersonation endpoints
  router.post('/impersonate/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Find the user to impersonate
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Generate impersonation token
      const accessToken = tokenService.generateImpersonationToken(
        user._id?.toString() || userId,
        user.role,
        [] // TODO: Add user permissions when implemented
      );

      logger.info(`Generated impersonation token for user ${user.email}`);

      return res.json({
        success: true,
        message: `Impersonating user: ${user.firstName} ${user.lastName} (${user.email})`,
        accessToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        impersonated: true
      });
    } catch (error) {
      logger.error('Impersonation failed', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Impersonation failed'
      });
    }
  });

  router.post('/impersonate/role/:role', async (req, res) => {
    try {
      const { role } = req.params;
      
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be "hacker" or "staff"'
        });
      }

      // Find a user with the specified role
      const user = await User.findOne({ role: role as UserRole });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: `No users found with role: ${role}`
        });
      }

      // Generate impersonation token
      const accessToken = tokenService.generateImpersonationToken(
        user._id?.toString() || user.email,
        user.role,
        []
      );

      logger.info(`Generated impersonation token for ${role} user: ${user.email}`);

      return res.json({
        success: true,
        message: `Impersonating ${role}: ${user.firstName} ${user.lastName} (${user.email})`,
        accessToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        impersonated: true
      });
    } catch (error) {
      logger.error('Role impersonation failed', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Role impersonation failed'
      });
    }
  });

  router.get('/users', async (_req, res) => {
    try {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      
      res.json({
        success: true,
        users: users.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          school: user.school,
          major: user.major,
          grade: user.grade,
          createdAt: user.createdAt
        }))
      });
    } catch (error) {
      logger.error('Get users failed', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get users'
      });
    }
  });

  logger.info('Admin tool routes enabled');
  return router;
};

// System information utility
export const getSystemInfo = (): object => {
  // Get basic MongoDB connection info
  let dbInfo = {
    connected: mongoose.connection.readyState === 1,
    uri: config.MONGODB_URI ? 'Connected to Atlas' : 'Not configured',
    dbName: mongoose.connection.readyState === 1 ? mongoose.connection.db?.databaseName || 'Unknown' : 'Disconnected'
  };

  return {
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: dbInfo
  };
};
