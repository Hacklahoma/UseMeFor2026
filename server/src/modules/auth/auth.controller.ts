import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.types';
import { logger } from '../../config/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const loginData = loginSchema.parse(req.body);
      
      // Attempt login
      const result = await this.authService.login(loginData);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Login controller error', error);
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Login failed' 
      });
    }
  };

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const registerData = registerSchema.parse(req.body);
      
      // Attempt registration
      const result = await this.authService.register(registerData);
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Registration controller error', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }
      
      const result = await this.authService.refreshToken(refreshToken);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Token refresh controller error', error);
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Token refresh failed' 
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      
      await this.authService.logout(userId);
      
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout controller error', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Logout failed' 
      });
    }
  };
}
