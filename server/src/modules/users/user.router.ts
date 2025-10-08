import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuth } from '../../auth/middleware/requireAuth';
import { requireRole } from '../../auth/middleware/requireRole';
import { UserRole } from '../../db/models/User';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(requireAuth);

// Get current user (any authenticated user)
router.get('/me', userController.getCurrentUser);

// Get single user (any authenticated user)
router.get('/:id', userController.getUser);

// Update current user (any authenticated user can update themselves)
router.put('/me', userController.getCurrentUser); // TODO: Add updateCurrentUser method

// Admin/Staff only routes
router.get('/', requireRole(UserRole.STAFF), userController.getUsers);
router.put('/:id', requireRole(UserRole.STAFF), userController.updateUser);
router.delete('/:id', requireRole(UserRole.STAFF), userController.deleteUser);

export { router as userRouter };
