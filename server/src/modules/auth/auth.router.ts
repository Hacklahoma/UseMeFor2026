import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authRateLimiter } from '../../auth/middleware/rateLimit';
import { requireAuth } from '../../auth/middleware/requireAuth';

const router = Router();
const authController = new AuthController();

// Public routes (no auth required)
router.post('/login', authRateLimiter, authController.login);
router.post('/register', authRateLimiter, authController.register);
router.post('/refresh', authController.refreshToken);

// Protected routes (auth required)
router.post('/logout', requireAuth, authController.logout);

export { router as authRouter };
