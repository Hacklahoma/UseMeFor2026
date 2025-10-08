import User, { UserRole } from '../models/User';
import { passwordService } from '../../auth/password';
import { logger } from '../../config/logger';

// Sample user data for development
const sampleUsers = [
  // Staff Users
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hacklahoma.org',
    password: 'Admin123!',
    role: UserRole.STAFF,
    school: 'University of Oklahoma',
    major: 'Computer Science',
    grade: 'Graduate',
    socialLinks: {
      github: 'https://github.com/admin',
      linkedin: 'https://linkedin.com/in/admin'
    }
  },
  {
    firstName: 'Staff',
    lastName: 'Member',
    email: 'staff@hacklahoma.org',
    password: 'Staff123!',
    role: UserRole.STAFF,
    school: 'Oklahoma State University',
    major: 'Information Technology',
    grade: 'Senior'
  },
  
  // Hacker Users
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@student.ou.edu',
    password: 'Hacker123!',
    role: UserRole.HACKER,
    school: 'University of Oklahoma',
    major: 'Computer Science',
    grade: 'Junior',
    socialLinks: {
      github: 'https://github.com/johndoe',
      discord: 'johndoe#1234'
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@okstate.edu',
    password: 'Hacker123!',
    role: UserRole.HACKER,
    school: 'Oklahoma State University',
    major: 'Software Engineering',
    grade: 'Sophomore',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/janesmith',
      instagram: 'https://instagram.com/janesmith'
    }
  },
  {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.j@tulsau.edu',
    password: 'Hacker123!',
    role: UserRole.HACKER,
    school: 'University of Tulsa',
    major: 'Cybersecurity',
    grade: 'Senior'
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@uco.edu',
    password: 'Hacker123!',
    role: UserRole.HACKER,
    school: 'University of Central Oklahoma',
    major: 'Data Science',
    grade: 'Freshman',
    socialLinks: {
      github: 'https://github.com/mariagarcia',
      linkedin: 'https://linkedin.com/in/mariagarcia'
    }
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.w@nsu.edu',
    password: 'Hacker123!',
    role: UserRole.HACKER,
    school: 'Northeastern State University',
    major: 'Computer Information Systems',
    grade: 'Junior'
  }
];

export class DatabaseSeeder {
  // Seed all sample users
  async seedUsers(): Promise<{ created: number; skipped: number; errors: string[] }> {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[]
    };

    logger.info('Starting user seeding process...');

    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          logger.debug(`User ${userData.email} already exists, skipping`);
          results.skipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await passwordService.hashPassword(userData.password);

        // Create user
        const user = new User({
          ...userData,
          password: hashedPassword
        });

        await user.save();
        logger.info(`Created user: ${userData.email} (${userData.role})`);
        results.created++;

      } catch (error) {
        const errorMsg = `Failed to create user ${userData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        logger.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    logger.info(`User seeding completed. Created: ${results.created}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
    return results;
  }

  // Create a specific user with custom data
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    school?: string;
    major?: string;
    grade?: string;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      discord?: string;
      instagram?: string;
    };
  }): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await passwordService.hashPassword(userData.password);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
        role: userData.role || UserRole.HACKER
      });

      await user.save();
      logger.info(`Created custom user: ${userData.email}`);
      
      return user.toJSON();
    } catch (error) {
      logger.error('Failed to create custom user', error);
      throw error;
    }
  }

  // Get database statistics
  async getDatabaseStats(): Promise<{
    users: { total: number; hackers: number; staff: number };
    collections: Record<string, number>;
  }> {
    try {
      const [totalUsers, hackers, staff] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: UserRole.HACKER }),
        User.countDocuments({ role: UserRole.STAFF })
      ]);

      return {
        users: {
          total: totalUsers,
          hackers,
          staff
        },
        collections: {
          users: totalUsers
          // Add more collections as they're created
        }
      };
    } catch (error) {
      logger.error('Failed to get database stats', error);
      throw error;
    }
  }

  // Clear all data (DANGEROUS - dev only)
  async clearDatabase(): Promise<{ deletedCollections: string[]; deletedCounts: Record<string, number> }> {
    try {
      logger.warn('CLEARING DATABASE - This will delete all data!');

      const userCount = await User.countDocuments();
      await User.deleteMany({});

      const result = {
        deletedCollections: ['users'],
        deletedCounts: {
          users: userCount
        }
      };

      logger.warn(`Database cleared. Deleted ${userCount} users`);
      return result;
    } catch (error) {
      logger.error('Failed to clear database', error);
      throw error;
    }
  }

  // Seed everything (full database setup)
  async seedAll(): Promise<{
    users: { created: number; skipped: number; errors: string[] };
    // Add more seeding results as needed
  }> {
    logger.info('Starting full database seeding...');
    
    const userResults = await this.seedUsers();
    
    logger.info('Full database seeding completed');
    return {
      users: userResults
    };
  }
}

// Export singleton instance
export const databaseSeeder = new DatabaseSeeder();
