import User from '../../db/models/User';
import { UpdateUserRequest, GetUsersQuery, UserResponse, UsersListResponse } from './user.types';
import { logger } from '../../config/logger';

export class UserService {
  async getUserById(id: string): Promise<UserResponse | null> {
    try {
      const user = await User.findById(id).select('-password');
      return user ? this.formatUserResponse(user) : null;
    } catch (error) {
      logger.error('Get user by ID error', error);
      throw error;
    }
  }

  async getUsers(query: GetUsersQuery): Promise<UsersListResponse> {
    try {
      const { page, limit, role, search } = query;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Execute queries
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        User.countDocuments(filter)
      ]);

      return {
        users: users.map(user => this.formatUserResponse(user)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get users error', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: UpdateUserRequest): Promise<UserResponse | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      return user ? this.formatUserResponse(user) : null;
    } catch (error) {
      logger.error('Update user error', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await User.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error('Delete user error', error);
      throw error;
    }
  }

  private formatUserResponse(user: any): UserResponse {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      school: user.school,
      major: user.major,
      grade: user.grade,
      role: user.role,
      profilePicture: user.profilePicture,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
