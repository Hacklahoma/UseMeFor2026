# 🗄️ Hacklahoma 2026 - Database Schema

> Comprehensive database schema documentation for the Hacklahoma 2026 platform

---

## 🎯 **Database Overview**

The Hacklahoma 2026 platform uses MongoDB as its primary database, with Mongoose as the Object Document Mapper (ODM). The database is designed to support both hackathon participants (hackers) and event staff (exec) with role-based access control.

---

## 🏗️ **Database Architecture**

### **Database Structure**
```
hacklahoma2026_dev (Development)
├── users          # User accounts and profiles
├── sessions       # User sessions and tokens
├── events         # Hackathon events (future)
├── projects       # Hackathon projects (future)
└── submissions    # Project submissions (future)

hacklahoma2026_test (Testing)
├── users          # Test user data
└── sessions       # Test session data

hacklahoma2026_prod (Production)
├── users          # Production user data
├── sessions       # Production session data
└── [future collections]
```

---

## 👥 **Users Collection**

### **Schema Definition**
```typescript
interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  school?: string;
  major?: string;
  grade?: string;
  role: UserRole;
  profilePicture?: string;
  socialLinks: SocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

enum UserRole {
  HACKER = 'hacker',
  STAFF = 'staff'
}

interface SocialLinks {
  github?: string;
  linkedin?: string;
  discord?: string;
  instagram?: string;
}
```

### **Mongoose Schema**
```typescript
const userSchema = new Schema<IUser>({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  school: { 
    type: String,
    trim: true,
    maxlength: [100, 'School name cannot exceed 100 characters']
  },
  major: { 
    type: String,
    trim: true,
    maxlength: [100, 'Major cannot exceed 100 characters']
  },
  grade: { 
    type: String,
    trim: true,
    maxlength: [50, 'Grade cannot exceed 50 characters']
  },
  role: { 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.HACKER 
  },
  profilePicture: { 
    type: String, 
    default: '',
    trim: true
  },
  socialLinks: {
    github: { 
      type: String, 
      default: '',
      trim: true
    },
    linkedin: { 
      type: String, 
      default: '',
      trim: true
    },
    discord: { 
      type: String, 
      default: '',
      trim: true
    },
    instagram: { 
      type: String, 
      default: '',
      trim: true
    }
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      const { password, ...userWithoutPassword } = ret;
      return userWithoutPassword;
    }
  }
});
```

### **Indexes**
```typescript
// Unique index on email
userSchema.index({ email: 1 }, { unique: true });

// Index for role-based queries
userSchema.index({ role: 1 });

// Index for sorting by creation date
userSchema.index({ createdAt: -1 });

// Compound index for role and creation date
userSchema.index({ role: 1, createdAt: -1 });
```

### **Virtual Fields**
```typescript
// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});
```

### **Sample Documents**

**Hacker User:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@ou.edu",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j4",
  "school": "University of Oklahoma",
  "major": "Computer Science",
  "grade": "Junior",
  "role": "hacker",
  "profilePicture": "",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "discord": "johndoe#1234",
    "instagram": ""
  },
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

**Staff User:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@hacklahoma.org",
  "password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4j4j4j4j4j4",
  "school": "University of Oklahoma",
  "major": "Information Technology",
  "grade": "Graduate",
  "role": "staff",
  "profilePicture": "",
  "socialLinks": {
    "github": "https://github.com/janesmith",
    "linkedin": "https://linkedin.com/in/janesmith",
    "discord": "",
    "instagram": ""
  },
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

---

## 🔐 **Sessions Collection**

### **Schema Definition**
```typescript
interface ISession extends Document {
  userId: string;
  sessionId: string;
  refreshTokenId: string;
  ip: string;
  userAgent: string;
  isRevoked: boolean;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Mongoose Schema**
```typescript
const sessionSchema = new Schema<ISession>({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  refreshTokenId: { 
    type: String, 
    required: true,
    index: true 
  },
  ip: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  isRevoked: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  revokedAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});
```

### **Indexes**
```typescript
// Compound index for user sessions
sessionSchema.index({ userId: 1, isRevoked: 1 });

// Index for session lookup
sessionSchema.index({ sessionId: 1, isRevoked: 1 });

// TTL index for automatic cleanup (30 days)
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Index for cleanup queries
sessionSchema.index({ isRevoked: 1, revokedAt: 1 });
```

### **Sample Document**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "userId": "507f1f77bcf86cd799439011",
  "sessionId": "sess_abc123def456",
  "refreshTokenId": "rt_xyz789uvw012",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "isRevoked": false,
  "revokedAt": null,
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
}
```

---

## 🔍 **Query Patterns**

### **Common Queries**

**Get User by Email:**
```typescript
const user = await User.findOne({ email: 'john.doe@ou.edu' });
```

**Get All Hackers:**
```typescript
const hackers = await User.find({ role: 'hacker' })
  .select('firstName lastName email school major')
  .sort({ createdAt: -1 });
```

**Get Active Sessions for User:**
```typescript
const sessions = await Session.find({ 
  userId: userId, 
  isRevoked: false 
}).sort({ createdAt: -1 });
```

**Search Users by Name:**
```typescript
const users = await User.find({
  $or: [
    { firstName: { $regex: searchTerm, $options: 'i' } },
    { lastName: { $regex: searchTerm, $options: 'i' } }
  ]
});
```

**Get Users by School:**
```typescript
const users = await User.find({ school: 'University of Oklahoma' })
  .select('firstName lastName email major grade')
  .sort({ lastName: 1 });
```

### **Aggregation Queries**

**User Statistics:**
```typescript
const stats = await User.aggregate([
  {
    $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      hackers: {
        $sum: { $cond: [{ $eq: ['$role', 'hacker'] }, 1, 0] }
      },
      staff: {
        $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] }
      }
    }
  }
]);
```

**Users by School:**
```typescript
const schoolStats = await User.aggregate([
  { $match: { school: { $exists: true, $ne: '' } } },
  {
    $group: {
      _id: '$school',
      count: { $sum: 1 },
      hackers: {
        $sum: { $cond: [{ $eq: ['$role', 'hacker'] }, 1, 0] }
      }
    }
  },
  { $sort: { count: -1 } }
]);
```

**Recent Registrations:**
```typescript
const recentUsers = await User.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);
```

---

## 🔧 **Database Operations**

### **User Operations**

**Create User:**
```typescript
const createUser = async (userData: CreateUserData): Promise<IUser> => {
  const hashedPassword = await passwordService.hashPassword(userData.password);
  
  const user = new User({
    ...userData,
    password: hashedPassword
  });
  
  return await user.save();
};
```

**Update User:**
```typescript
const updateUser = async (userId: string, updates: Partial<IUser>): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );
};
```

**Delete User:**
```typescript
const deleteUser = async (userId: string): Promise<boolean> => {
  const result = await User.findByIdAndDelete(userId);
  return !!result;
};
```

**Find User by Email:**
```typescript
const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email: email.toLowerCase() });
};
```

### **Session Operations**

**Create Session:**
```typescript
const createSession = async (
  userId: string,
  sessionId: string,
  refreshTokenId: string,
  ip: string,
  userAgent: string
): Promise<ISession> => {
  const session = new Session({
    userId,
    sessionId,
    refreshTokenId,
    ip,
    userAgent
  });
  
  return await session.save();
};
```

**Revoke Session:**
```typescript
const revokeSession = async (sessionId: string): Promise<boolean> => {
  const result = await Session.updateOne(
    { sessionId, isRevoked: false },
    { 
      isRevoked: true, 
      revokedAt: new Date() 
    }
  );
  
  return result.modifiedCount > 0;
};
```

**Get Active Sessions:**
```typescript
const getActiveSessions = async (userId: string): Promise<ISession[]> => {
  return await Session.find({ 
    userId, 
    isRevoked: false 
  }).sort({ createdAt: -1 });
};
```

---

## 📊 **Database Statistics**

### **Collection Statistics**
```typescript
const getCollectionStats = async () => {
  const db = mongoose.connection.db;
  
  const stats = await db.stats();
  
  return {
    database: {
      size: stats.dataSize,
      storageSize: stats.storageSize,
      collections: stats.collections,
      documents: stats.objects,
      indexes: stats.indexes
    },
    users: {
      total: await User.countDocuments(),
      hackers: await User.countDocuments({ role: 'hacker' }),
      staff: await User.countDocuments({ role: 'staff' })
    },
    sessions: {
      total: await Session.countDocuments(),
      active: await Session.countDocuments({ isRevoked: false }),
      revoked: await Session.countDocuments({ isRevoked: true })
    }
  };
};
```

### **Performance Metrics**
```typescript
const getPerformanceMetrics = async () => {
  const users = await User.find({}).explain('executionStats');
  const sessions = await Session.find({}).explain('executionStats');
  
  return {
    users: {
      executionTime: users.executionStats.executionTimeMillis,
      totalDocsExamined: users.executionStats.totalDocsExamined,
      totalDocsReturned: users.executionStats.totalDocsReturned
    },
    sessions: {
      executionTime: sessions.executionStats.executionTimeMillis,
      totalDocsExamined: sessions.executionStats.totalDocsExamined,
      totalDocsReturned: sessions.executionStats.totalDocsReturned
    }
  };
};
```

---

## 🔒 **Security Considerations**

### **Data Protection**
- **Password Hashing**: All passwords are hashed using bcrypt with 12 rounds
- **Email Uniqueness**: Email addresses are unique and case-insensitive
- **Input Validation**: All inputs are validated using Zod schemas
- **Data Sanitization**: Passwords are excluded from JSON responses

### **Access Control**
- **Role-Based Access**: Users have either 'hacker' or 'staff' roles
- **Session Management**: Sessions can be revoked and have TTL
- **IP Tracking**: User sessions track IP addresses for security
- **User Agent Tracking**: Sessions track user agents for security

### **Data Integrity**
- **Required Fields**: Critical fields are marked as required
- **Field Length Limits**: String fields have maximum length constraints
- **Email Validation**: Email format is validated using regex
- **Unique Constraints**: Email addresses must be unique

---

## 🚀 **Migrations**

### **Migration Strategy**
```typescript
// Example migration: Add new field to users
export const addUserFlags = async (User: Model<any>) => {
  await User.updateMany(
    { flags: { $exists: false } },
    { $set: { flags: { marketingOptIn: false, beta: false } } }
  );
};

// Example migration: Create new index
export const addUserSchoolIndex = async (User: Model<any>) => {
  await User.collection.createIndex({ school: 1 });
};
```

### **Migration Runner**
```typescript
const runMigrations = async () => {
  const migrations = [
    { name: 'add-user-flags', up: addUserFlags },
    { name: 'add-user-school-index', up: addUserSchoolIndex }
  ];
  
  for (const migration of migrations) {
    try {
      await migration.up(User);
      console.log(`Migration ${migration.name} completed`);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
    }
  }
};
```

---

## 🧪 **Testing Data**

### **Test User Data**
```typescript
const testUsers = [
  {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@hacklahoma.org',
    password: 'TestPass123!',
    role: 'hacker',
    school: 'University of Oklahoma',
    major: 'Computer Science'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hacklahoma.org',
    password: 'AdminPass123!',
    role: 'staff',
    school: 'University of Oklahoma',
    major: 'Information Technology'
  }
];
```

### **Test Session Data**
```typescript
const testSessions = [
  {
    userId: 'test_user_id',
    sessionId: 'test_session_123',
    refreshTokenId: 'test_refresh_456',
    ip: '127.0.0.1',
    userAgent: 'Test Agent'
  }
];
```

---

## 📈 **Performance Optimization**

### **Indexing Strategy**
- **Unique Indexes**: Email addresses for fast lookups
- **Compound Indexes**: Role and creation date for filtered queries
- **TTL Indexes**: Automatic cleanup of old sessions
- **Sparse Indexes**: Optional fields to reduce index size

### **Query Optimization**
- **Selective Fields**: Use `.select()` to limit returned fields
- **Pagination**: Use `.limit()` and `.skip()` for large result sets
- **Sorting**: Use indexed fields for sorting
- **Aggregation**: Use aggregation pipelines for complex queries

### **Connection Management**
- **Connection Pooling**: Configure MongoDB connection pool
- **Connection Timeout**: Set appropriate timeout values
- **Retry Logic**: Implement retry logic for failed connections

---

## 🔄 **Backup and Recovery**

### **Backup Strategy**
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/hacklahoma2026_dev" --out=backup/

# Restore backup
mongorestore --uri="mongodb://localhost:27017/hacklahoma2026_dev" backup/hacklahoma2026_dev/
```

### **MongoDB Atlas Backup**
- **Automatic Backups**: Enabled by default
- **Point-in-Time Recovery**: Available for production
- **Cross-Region Replication**: For disaster recovery

---

**🏈 This database schema provides a solid foundation for the Hacklahoma 2026 platform, ensuring data integrity, security, and performance.**
