import { z } from 'zod';
import { UserRole } from '../../db/models/User';

// User update validation schema
export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  school: z.string().max(100).optional(),
  major: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
  profilePicture: z.string().url().optional(),
  socialLinks: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    discord: z.string().optional(),
    instagram: z.string().optional()
  }).optional()
});

// User query parameters
export const getUsersQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().optional()
});

// Type inference
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

// Response types
export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  school?: string;
  major?: string;
  grade?: string;
  role: UserRole;
  profilePicture?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    discord?: string;
    instagram?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UsersListResponse {
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
