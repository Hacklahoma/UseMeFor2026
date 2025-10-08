import { UserRole } from '../../src/db/models/User';

export const testUsers = {
  // Staff users for testing
  adminUser: {
    firstName: 'Test',
    lastName: 'Admin',
    email: 'test.admin@hacklahoma.org',
    password: 'AdminTest123!',
    role: UserRole.STAFF,
    school: 'University of Oklahoma',
    major: 'Computer Science',
    grade: 'Graduate'
  },

  staffUser: {
    firstName: 'Test',
    lastName: 'Staff',
    email: 'test.staff@hacklahoma.org', 
    password: 'StaffTest123!',
    role: UserRole.STAFF,
    school: 'Oklahoma State University',
    major: 'Information Technology',
    grade: 'Senior'
  },

  // Hacker users for testing
  hackerUser: {
    firstName: 'Test',
    lastName: 'Hacker',
    email: 'test.hacker@student.ou.edu',
    password: 'HackerTest123!',
    role: UserRole.HACKER,
    school: 'University of Oklahoma',
    major: 'Computer Science',
    grade: 'Junior',
    socialLinks: {
      github: 'https://github.com/testhacker',
      discord: 'testhacker#1234'
    }
  },

  hackerUser2: {
    firstName: 'Jane',
    lastName: 'Tester',
    email: 'jane.tester@okstate.edu',
    password: 'JaneTest123!',
    role: UserRole.HACKER,
    school: 'Oklahoma State University', 
    major: 'Software Engineering',
    grade: 'Sophomore',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/janetester'
    }
  },

  // Invalid user data for testing validation
  invalidUser: {
    firstName: '', // Invalid - empty
    lastName: 'Test',
    email: 'invalid-email', // Invalid format
    password: '123', // Too short
    role: 'invalid_role' as any // Invalid role
  },

  // User with missing required fields
  incompleteUser: {
    firstName: 'Incomplete',
    // Missing lastName, email, password
    role: UserRole.HACKER
  }
};

export const sampleTokenPayloads = {
  staffToken: {
    sub: '507f1f77bcf86cd799439011',
    role: UserRole.STAFF,
    perms: ['users.read', 'users.write', 'admin.access'],
    sid: 'session_staff_123'
  },

  hackerToken: {
    sub: '507f1f77bcf86cd799439012', 
    role: UserRole.HACKER,
    perms: ['users.read'],
    sid: 'session_hacker_456'
  },

  impersonatedStaffToken: {
    sub: '507f1f77bcf86cd799439011',
    role: UserRole.STAFF,
    perms: ['users.read', 'users.write'],
    sid: 'impersonate_1234567890_abc123',
    impersonated: true
  },

  impersonatedHackerToken: {
    sub: '507f1f77bcf86cd799439012',
    role: UserRole.HACKER, 
    perms: [],
    sid: 'impersonate_1234567891_def456',
    impersonated: true
  }
};

export const mockSessionIds = {
  validSession: 'session_valid_123456789',
  expiredSession: 'session_expired_987654321',
  revokedSession: 'session_revoked_555666777',
  impersonateSession: 'impersonate_1234567890_xyz789'
};

export const testEmails = {
  valid: [
    'test@example.com',
    'user.name@domain.co.uk',
    'student@university.edu',
    'admin@hacklahoma.org'
  ],
  invalid: [
    'invalid-email',
    '@domain.com',
    'user@',
    'user..name@domain.com',
    'user name@domain.com'
  ]
};

export const testPasswords = {
  valid: [
    'ValidPass123!',
    'AnotherGood1@',
    'Complex$Pass9',
    'Secure&Strong7'
  ],
  invalid: [
    '123', // Too short
    'password', // Too common
    'PASSWORD123', // No lowercase
    'password123', // No uppercase
    'Password', // No number
    'Password123' // No special character
  ]
};
