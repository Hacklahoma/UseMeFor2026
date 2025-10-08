import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../config/logger';
import { UserRole } from '../db/models/User';

// Token payload interface (matches NOTES.md specification)
export interface TokenPayload {
  sub: string;           // user ID
  role: UserRole;        // user role
  perms: string[];       // user permissions
  sid: string;           // session ID for revocation
  impersonated?: boolean; // flag for impersonated tokens (admin tool)
  iat?: number;          // issued at
  exp?: number;          // expires at
}

// Refresh token payload
export interface RefreshTokenPayload {
  sub: string;           // user ID
  sid: string;           // session ID
  type: 'refresh';       // token type
  iat?: number;
  exp?: number;
}

export class TokenService {
  // Generate access token (short-lived)
  generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
        expiresIn: config.JWT_ACCESS_TTL,
        issuer: config.SESSION_ISSUER
      } as any);
    } catch (error) {
      logger.error('Failed to generate access token', error);
      throw new Error('Token generation failed');
    }
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(userId: string, sessionId: string): string {
    try {
      const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
        sub: userId,
        sid: sessionId,
        type: 'refresh'
      };

      return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
        expiresIn: config.JWT_REFRESH_TTL,
        issuer: config.SESSION_ISSUER
      } as any);
    } catch (error) {
      logger.error('Failed to generate refresh token', error);
      throw new Error('Refresh token generation failed');
    }
  }

  // Verify access token
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET, {
        issuer: config.SESSION_ISSUER
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      logger.error('Access token verification failed', error);
      throw new Error('Token verification failed');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, {
        issuer: config.SESSION_ISSUER
      }) as RefreshTokenPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      logger.error('Refresh token verification failed', error);
      throw new Error('Refresh token verification failed');
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Generate token pair (access + refresh)
  generateTokenPair(userId: string, role: UserRole, permissions: string[], sessionId: string, impersonated = false) {
    const accessToken = this.generateAccessToken({
      sub: userId,
      role,
      perms: permissions,
      sid: sessionId,
      impersonated
    });

    const refreshToken = this.generateRefreshToken(userId, sessionId);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseTimeToSeconds(config.JWT_ACCESS_TTL),
      impersonated
    };
  }

  // Generate impersonation token (admin tool only)
  generateImpersonationToken(userId: string, role: UserRole, permissions: string[] = []) {
    const sessionId = `impersonate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return this.generateAccessToken({
      sub: userId,
      role,
      perms: permissions,
      sid: sessionId,
      impersonated: true
    });
  }

  // Helper to convert time strings to seconds
  private parseTimeToSeconds(timeString: string): number {
    const match = timeString.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900;
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();
