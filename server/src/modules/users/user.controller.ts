import { Request, Response } from 'express';
import { UserService } from './user.service';
import { updateUserSchema, getUsersQuerySchema } from './user.types';
import { logger } from '../../config/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      logger.error('Get user controller error', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      });
    }
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = getUsersQuerySchema.parse(req.query);
      const result = await this.userService.getUsers(query);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Get users controller error', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get users' 
      });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = updateUserSchema.parse(req.body);

      const user = await this.userService.updateUser(id, updateData);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      logger.error('Update user controller error', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update user' 
      });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      logger.error('Delete user controller error', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete user' 
      });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      logger.error('Get current user controller error', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get current user' 
      });
    }
  };
}
