import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';

export class PasswordService {
  private readonly saltRounds = 12; // Higher than default for better security

  // Hash a plain text password
  async hashPassword(plainPassword: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.saltRounds);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      return hashedPassword;
    } catch (error) {
      logger.error('Password hashing failed', error);
      throw new Error('Password hashing failed');
    }
  }

  // Verify a plain text password against a hash
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error('Password verification failed', error);
      throw new Error('Password verification failed');
    }
  }

  // Validate password strength
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length (prevent DoS)
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    // Must contain lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Must contain uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Must contain number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Must contain special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password check (basic)
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a more secure password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate a secure random password (for admin use)
  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
}

// Export singleton instance
export const passwordService = new PasswordService();
