import mongoose, { Document, Schema } from 'mongoose';
import { logger } from '../config/logger';
import { config } from '../config';

// Session interface for TypeScript
export interface ISession extends Document {
  userId: string;
  sessionId: string;
  refreshTokenId: string;
  ip: string;
  userAgent: string;
  isRevoked: boolean;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Session schema
const sessionSchema = new Schema<ISession>({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  refreshTokenId: { 
    type: String, 
    required: true,
    index: true 
  },
  ip: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  isRevoked: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  revokedAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Indexes for performance
sessionSchema.index({ userId: 1, isRevoked: 1 });
sessionSchema.index({ createdAt: 1 }); // For cleanup
sessionSchema.index({ sessionId: 1, isRevoked: 1 });

// TTL index to automatically clean up old sessions (30 days)
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Session = mongoose.model<ISession>('Session', sessionSchema);

export class SessionStore {
  // Create a new session
  async createSession(
    userId: string, 
    sessionId: string, 
    refreshTokenId: string, 
    ip: string, 
    userAgent: string
  ): Promise<ISession> {
    try {
      const session = new Session({
        userId,
        sessionId,
        refreshTokenId,
        ip,
        userAgent
      });

      await session.save();
      logger.info('Session created', { userId, sessionId, ip });
      
      return session;
    } catch (error) {
      logger.error('Failed to create session', error);
      throw new Error('Session creation failed');
    }
  }

  // Get session by session ID
  async getSession(sessionId: string): Promise<ISession | null> {
    try {
      return await Session.findOne({ 
        sessionId, 
        isRevoked: false 
      });
    } catch (error) {
      logger.error('Failed to get session', error);
      throw new Error('Session retrieval failed');
    }
  }

  // Get all active sessions for a user
  async getUserSessions(userId: string): Promise<ISession[]> {
    try {
      return await Session.find({ 
        userId, 
        isRevoked: false 
      }).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Failed to get user sessions', error);
      throw new Error('User sessions retrieval failed');
    }
  }

  // Revoke a specific session
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      const result = await Session.updateOne(
        { sessionId, isRevoked: false },
        { 
          isRevoked: true, 
          revokedAt: new Date() 
        }
      );

      if (result.modifiedCount > 0) {
        logger.info('Session revoked', { sessionId });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to revoke session', error);
      throw new Error('Session revocation failed');
    }
  }

  // Revoke all sessions for a user (logout from all devices)
  async revokeAllUserSessions(userId: string): Promise<number> {
    try {
      const result = await Session.updateMany(
        { userId, isRevoked: false },
        { 
          isRevoked: true, 
          revokedAt: new Date() 
        }
      );

      logger.info('All user sessions revoked', { userId, count: result.modifiedCount });
      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to revoke all user sessions', error);
      throw new Error('Bulk session revocation failed');
    }
  }

  // Check if session is valid (not revoked)
  async isSessionValid(sessionId: string): Promise<boolean> {
    try {
      const session = await Session.findOne({ 
        sessionId, 
        isRevoked: false 
      });
      
      return !!session;
    } catch (error) {
      logger.error('Failed to validate session', error);
      return false;
    }
  }

  // Clean up old revoked sessions (manual cleanup)
  async cleanupOldSessions(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await Session.deleteMany({
        $or: [
          { isRevoked: true, revokedAt: { $lt: cutoffDate } },
          { createdAt: { $lt: cutoffDate } }
        ]
      });

      logger.info('Old sessions cleaned up', { deletedCount: result.deletedCount });
      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old sessions', error);
      throw new Error('Session cleanup failed');
    }
  }

  // Get session statistics for monitoring
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    revokedSessions: number;
    uniqueUsers: number;
  }> {
    try {
      const [stats] = await Session.aggregate([
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            activeSessions: {
              $sum: { $cond: [{ $eq: ['$isRevoked', false] }, 1, 0] }
            },
            revokedSessions: {
              $sum: { $cond: [{ $eq: ['$isRevoked', true] }, 1, 0] }
            },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            totalSessions: 1,
            activeSessions: 1,
            revokedSessions: 1,
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        }
      ]);

      return stats || {
        totalSessions: 0,
        activeSessions: 0,
        revokedSessions: 0,
        uniqueUsers: 0
      };
    } catch (error) {
      logger.error('Failed to get session stats', error);
      throw new Error('Session stats retrieval failed');
    }
  }

  // Periodic cleanup job (call this from a cron job or background task)
  async periodicCleanup(): Promise<void> {
    try {
      const pruneMinutes = config.SESSION_PRUNE_MINS;
      await this.cleanupOldSessions(Math.ceil(pruneMinutes / (24 * 60))); // Convert minutes to days
      logger.info('Periodic session cleanup completed');
    } catch (error) {
      logger.error('Periodic session cleanup failed', error);
    }
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();
export { Session };
