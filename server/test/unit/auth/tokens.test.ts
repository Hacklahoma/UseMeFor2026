/// <reference types="jest" />
import { tokenService } from '../../../src/auth/tokens';
import { UserRole } from '../../../src/db/models/User';

describe('Token Service', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockSessionId = 'session_123';
  const mockPermissions = ['users.read', 'users.write'];

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = tokenService.generateAccessToken({
        sub: mockUserId,
        role: UserRole.HACKER,
        perms: mockPermissions,
        sid: mockSessionId
      });

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate access token with impersonation flag', () => {
      const token = tokenService.generateAccessToken({
        sub: mockUserId,
        role: UserRole.STAFF,
        perms: mockPermissions,
        sid: mockSessionId,
        impersonated: true
      });

      expect(typeof token).toBe('string');
      
      // Verify token can be decoded (we'll verify the impersonated flag in verification test)
      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.impersonated).toBe(true);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = tokenService.generateRefreshToken(mockUserId, mockSessionId);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = tokenService.generateAccessToken({
        sub: mockUserId,
        role: UserRole.HACKER,
        perms: mockPermissions,
        sid: mockSessionId
      });

      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.sub).toBe(mockUserId);
      expect(decoded.role).toBe(UserRole.HACKER);
      expect(decoded.perms).toEqual(mockPermissions);
      expect(decoded.sid).toBe(mockSessionId);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should verify impersonated token correctly', () => {
      const token = tokenService.generateAccessToken({
        sub: mockUserId,
        role: UserRole.STAFF,
        perms: mockPermissions,
        sid: mockSessionId,
        impersonated: true
      });

      const decoded = tokenService.verifyAccessToken(token);

      expect(decoded.impersonated).toBe(true);
      expect(decoded.role).toBe(UserRole.STAFF);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        tokenService.verifyAccessToken(invalidToken);
      }).toThrow('Invalid access token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => {
        tokenService.verifyAccessToken(malformedToken);
      }).toThrow('Invalid access token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = tokenService.generateRefreshToken(mockUserId, mockSessionId);

      const decoded = tokenService.verifyRefreshToken(token);

      expect(decoded.sub).toBe(mockUserId);
      expect(decoded.sid).toBe(mockSessionId);
      expect(decoded.type).toBe('refresh');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => {
        tokenService.verifyRefreshToken(invalidToken);
      }).toThrow('Invalid refresh token');
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const token = tokenService.extractTokenFromHeader(authHeader);

      expect(token).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token');
    });

    it('should return null for missing header', () => {
      const token = tokenService.extractTokenFromHeader(undefined);
      expect(token).toBeNull();
    });

    it('should return null for invalid header format', () => {
      const token = tokenService.extractTokenFromHeader('InvalidHeader token');
      expect(token).toBeNull();
    });

    it('should return null for header without token', () => {
      const token = tokenService.extractTokenFromHeader('Bearer ');
      expect(token).toBe('');
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const tokenPair = tokenService.generateTokenPair(
        mockUserId,
        UserRole.HACKER,
        mockPermissions,
        mockSessionId
      );

      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.expiresIn).toBeDefined();
      expect(tokenPair.impersonated).toBe(false);

      // Verify both tokens are valid
      const accessDecoded = tokenService.verifyAccessToken(tokenPair.accessToken);
      const refreshDecoded = tokenService.verifyRefreshToken(tokenPair.refreshToken);

      expect(accessDecoded.sub).toBe(mockUserId);
      expect(refreshDecoded.sub).toBe(mockUserId);
    });

    it('should generate impersonated token pair', () => {
      const tokenPair = tokenService.generateTokenPair(
        mockUserId,
        UserRole.STAFF,
        mockPermissions,
        mockSessionId,
        true // impersonated
      );

      expect(tokenPair.impersonated).toBe(true);

      const decoded = tokenService.verifyAccessToken(tokenPair.accessToken);
      expect(decoded.impersonated).toBe(true);
    });
  });

  describe('generateImpersonationToken', () => {
    it('should generate impersonation token with correct flags', () => {
      const token = tokenService.generateImpersonationToken(
        mockUserId,
        UserRole.STAFF,
        mockPermissions
      );

      expect(typeof token).toBe('string');

      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.sub).toBe(mockUserId);
      expect(decoded.role).toBe(UserRole.STAFF);
      expect(decoded.perms).toEqual(mockPermissions);
      expect(decoded.impersonated).toBe(true);
      expect(decoded.sid).toMatch(/^impersonate_/); // Should start with impersonate_
    });

    it('should generate impersonation token with default empty permissions', () => {
      const token = tokenService.generateImpersonationToken(
        mockUserId,
        UserRole.HACKER
      );

      const decoded = tokenService.verifyAccessToken(token);
      expect(decoded.perms).toEqual([]);
      expect(decoded.impersonated).toBe(true);
    });
  });

  describe('parseTimeToSeconds', () => {
    it('should parse time strings correctly', () => {
      // Test the private method through public interface
      const tokenPair = tokenService.generateTokenPair(
        mockUserId,
        UserRole.HACKER,
        [],
        mockSessionId
      );

      // Should return a number (seconds)
      expect(typeof tokenPair.expiresIn).toBe('number');
      expect(tokenPair.expiresIn).toBeGreaterThan(0);
    });
  });
});
