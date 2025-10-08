/// <reference types="jest" />
import request from 'supertest';
import { createApp } from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/db/connect';
import User from '../../src/db/models/User';

describe('Admin Tool Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    // Connect to test database
    await connectDatabase();
    app = await createApp();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await disconnectDatabase();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
  });

  describe('GET /admin/health', () => {
    it('should return admin tool health status', async () => {
      const response = await request(app)
        .get('/admin/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'Admin tool active',
        environment: 'test',
        timestamp: expect.any(String)
      });
    });
  });

  describe('POST /admin/seed-users', () => {
    it('should seed database with sample users', async () => {
      const response = await request(app)
        .post('/admin/seed-users')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'User seeding completed',
        results: {
          created: 7,
          skipped: 0,
          errors: []
        }
      });

      // Verify users were created
      const userCount = await User.countDocuments();
      expect(userCount).toBe(7);

      // Verify staff and hacker counts
      const staffCount = await User.countDocuments({ role: 'staff' });
      const hackerCount = await User.countDocuments({ role: 'hacker' });
      expect(staffCount).toBe(2);
      expect(hackerCount).toBe(5);
    });

    it('should skip existing users on second run', async () => {
      // First seeding
      await request(app)
        .post('/admin/seed-users')
        .expect(200);

      // Second seeding should skip all users
      const response = await request(app)
        .post('/admin/seed-users')
        .expect(200);

      expect(response.body.results).toEqual({
        created: 0,
        skipped: 7,
        errors: []
      });
    });
  });

  describe('GET /admin/database-stats', () => {
    it('should return database statistics', async () => {
      // Seed some users first
      await request(app)
        .post('/admin/seed-users')
        .expect(200);

      const response = await request(app)
        .get('/admin/database-stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        stats: {
          users: {
            total: 7,
            hackers: 5,
            staff: 2
          },
          collections: {
            users: 7
          }
        }
      });
    });

    it('should return zero stats for empty database', async () => {
      const response = await request(app)
        .get('/admin/database-stats')
        .expect(200);

      expect(response.body.stats.users).toEqual({
        total: 0,
        hackers: 0,
        staff: 0
      });
    });
  });

  describe('POST /admin/clear-database', () => {
    it('should clear all database data', async () => {
      // Seed some users first
      await request(app)
        .post('/admin/seed-users')
        .expect(200);

      // Verify users exist
      const initialCount = await User.countDocuments();
      expect(initialCount).toBe(7);

      // Clear database
      const response = await request(app)
        .post('/admin/clear-database')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Database cleared successfully',
        results: {
          deletedCollections: ['users'],
          deletedCounts: {
            users: 7
          }
        }
      });

      // Verify database is empty
      const finalCount = await User.countDocuments();
      expect(finalCount).toBe(0);
    });
  });

  describe('GET /admin/users', () => {
    it('should return list of all users', async () => {
      // Seed users first
      await request(app)
        .post('/admin/seed-users')
        .expect(200);

      const response = await request(app)
        .get('/admin/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(7);
      
      // Check user structure
      const user = response.body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('password'); // Password should be excluded
    });

    it('should return empty array for no users', async () => {
      const response = await request(app)
        .get('/admin/users')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        users: []
      });
    });
  });

  describe('POST /admin/impersonate/role/:role', () => {
    beforeEach(async () => {
      // Seed users for impersonation tests
      await request(app)
        .post('/admin/seed-users')
        .expect(200);
    });

    it('should generate impersonation token for staff role', async () => {
      const response = await request(app)
        .post('/admin/impersonate/role/staff')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.impersonated).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.role).toBe('staff');
      expect(response.body.message).toContain('Impersonating staff:');
    });

    it('should generate impersonation token for hacker role', async () => {
      const response = await request(app)
        .post('/admin/impersonate/role/hacker')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.impersonated).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.role).toBe('hacker');
      expect(response.body.message).toContain('Impersonating hacker:');
    });

    it('should return error for invalid role', async () => {
      const response = await request(app)
        .post('/admin/impersonate/role/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'Invalid role. Must be "hacker" or "staff"'
      });
    });

    it('should return error when no users exist for role', async () => {
      // Clear database
      await User.deleteMany({});

      const response = await request(app)
        .post('/admin/impersonate/role/staff')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'No users found with role: staff'
      });
    });
  });

  describe('POST /admin/impersonate/:userId', () => {
    let userId: string;

    beforeEach(async () => {
      // Create a test user
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'hacker'
      });
      const savedUser = await user.save();
      userId = savedUser._id?.toString() || savedUser.id;
    });

    it('should generate impersonation token for specific user', async () => {
      const response = await request(app)
        .post(`/admin/impersonate/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.impersonated).toBe(true);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.message).toContain('Impersonating user: Test User');
    });

    it('should return error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .post(`/admin/impersonate/${fakeId}`)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: 'User not found'
      });
    });
  });

  describe('GET /admin/system-info', () => {
    it('should return system information', async () => {
      const response = await request(app)
        .get('/admin/system-info')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.systemInfo).toHaveProperty('nodeVersion');
      expect(response.body.systemInfo).toHaveProperty('platform');
      expect(response.body.systemInfo).toHaveProperty('uptime');
      expect(response.body.systemInfo).toHaveProperty('memory');
      expect(response.body.systemInfo).toHaveProperty('environment');
      expect(response.body.systemInfo).toHaveProperty('timestamp');
      expect(response.body.systemInfo).toHaveProperty('database');
    });
  });

  describe('POST /admin/users', () => {
    it('should create a custom user', async () => {
      const userData = {
        firstName: 'Custom',
        lastName: 'User',
        email: 'custom@example.com',
        password: 'CustomPass123!',
        role: 'hacker',
        school: 'Test University',
        major: 'Computer Science'
      };

      const response = await request(app)
        .post('/admin/users')
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user.email).toBe('custom@example.com');
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const createdUser = await User.findOne({ email: 'custom@example.com' });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.firstName).toBe('Custom');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'duplicate@example.com',
        password: 'TestPass123!'
      };

      // Create first user
      await request(app)
        .post('/admin/users')
        .send(userData)
        .expect(200);

      // Try to create duplicate
      const response = await request(app)
        .post('/admin/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });
});
