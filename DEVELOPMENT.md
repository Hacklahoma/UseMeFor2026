# 💻 Hacklahoma 2026 - Development Guide

> Comprehensive development workflow and guidelines for the Hacklahoma 2026 platform

---

## 🎯 **Development Overview**

This guide covers the development workflow, coding standards, testing practices, and contribution guidelines for the Hacklahoma 2026 platform.

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18.0.0+
- npm 8.0.0+
- MongoDB 6.0+
- Git
- VS Code (recommended)

### **Initial Setup**
```bash
# Clone repository
git clone https://github.com/your-org/HacklahomaSite2026.git
cd HacklahomaSite2026

# Install dependencies
cd server && npm install
cd ../frontend && npm install
cd ../server/admin-gui && npm install

# Setup environment
cd ../server
cp env.example .env
# Edit .env with your configuration

# Start development servers
./start-all.sh
```

---

## 🏗️ **Project Structure**

```
HacklahomaSite2026/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── App.tsx          # Main application
│   │   ├── index.tsx        # Entry point
│   │   ├── types/           # TypeScript definitions
│   │   └── ui/              # UI components
│   │       ├── common/      # Shared components
│   │       └── pages/       # Page components
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies
│   └── tailwind.config.js   # Styling configuration
│
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── app.ts          # Express app setup
│   │   ├── server.ts       # Server startup
│   │   ├── config/         # Configuration
│   │   ├── db/             # Database layer
│   │   ├── auth/           # Authentication
│   │   ├── modules/        # Feature modules
│   │   ├── admin-tool/     # Admin endpoints
│   │   └── utils/          # Utilities
│   ├── test/               # Test suite
│   ├── dist/               # Compiled output
│   └── package.json        # Dependencies
│
└── server/admin-gui/        # Admin interface
    ├── server.js           # Express server
    ├── views/              # HTML templates
    ├── public/             # Static assets
    └── package.json        # Dependencies
```

---

## 🎨 **Frontend Development**

### **Technology Stack**
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 4.9.5** - Type-safe development
- **Tailwind CSS 3.4.0** - Utility-first styling
- **Motion** - Animation library

### **Development Commands**
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npx tsc --noEmit
```

### **Component Structure**
```typescript
// Example component structure
interface ComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({ 
  title, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`component-base ${className}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
};

export default Component;
```

### **Styling Guidelines**
```typescript
// Use Tailwind classes
<div className="flex flex-col space-y-4 p-6 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <p className="text-gray-600">Description</p>
</div>

// Custom CSS when needed
<div className="custom-component">
  <style jsx>{`
    .custom-component {
      /* Custom styles here */
    }
  `}</style>
</div>
```

### **State Management**
```typescript
// Use React hooks for state management
import { useState, useEffect } from 'react';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then(user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
};
```

---

## ⚙️ **Backend Development**

### **Technology Stack**
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **TypeScript 5.2.2** - Type-safe development
- **MongoDB 8.10.1** - Database with Mongoose
- **JWT** - Authentication
- **Zod** - Input validation

### **Development Commands**
```bash
cd server

# Start development server
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### **Module Structure**
```typescript
// Example module structure
// modules/users/user.controller.ts
export class UserController {
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

// modules/users/user.service.ts
export class UserService {
  async getAllUsers(): Promise<IUser[]> {
    return await User.find({}).select('-password');
  }
}

// modules/users/user.router.ts
const router = Router();
const userController = new UserController();

router.get('/', userController.getUsers);
export { router as userRouter };
```

### **Database Models**
```typescript
// Example model structure
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firstName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
```

### **Authentication Middleware**
```typescript
// Example middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = tokenService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## 🧪 **Testing**

### **Testing Strategy**
- **Unit Tests** - Individual functions and components
- **Integration Tests** - API endpoints and database operations
- **E2E Tests** - Full user workflows (future)

### **Backend Testing**
```typescript
// Example unit test
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should create a user', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    const user = await userService.createUser(userData);
    expect(user.email).toBe('john@example.com');
  });
});
```

### **Frontend Testing**
```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('renders user information', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

### **Running Tests**
```bash
# Backend tests
cd server
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage

# Frontend tests
cd frontend
npm test                   # Run all tests
npm test -- --watch       # Watch mode
```

---

## 🔧 **Development Tools**

### **VS Code Extensions**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "mongodb.mongodb-vscode",
    "ms-vscode.vscode-json"
  ]
}
```

### **VS Code Settings**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

### **Git Hooks**
```bash
# Install husky for git hooks
npm install --save-dev husky

# Setup pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm test"
```

---

## 📝 **Coding Standards**

### **TypeScript Guidelines**
```typescript
// Use explicit types
interface UserProps {
  id: string;
  name: string;
  email: string;
  role: 'hacker' | 'staff';
}

// Use enums for constants
enum UserRole {
  HACKER = 'hacker',
  STAFF = 'staff'
}

// Use strict typing
const getUser = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};
```

### **React Guidelines**
```typescript
// Use functional components with hooks
const UserCard: React.FC<UserProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(() => {
    setIsLoading(true);
    // Handle click
  }, []);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Click me'}
      </button>
    </div>
  );
};
```

### **API Guidelines**
```typescript
// Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error handling
const handleError = (error: Error, res: Response) => {
  logger.error('API Error', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

---

## 🔄 **Git Workflow**

### **Branch Strategy**
```
main                    # Production branch
├── develop            # Development branch
├── feature/user-auth  # Feature branches
├── bugfix/login-fix   # Bug fix branches
└── hotfix/security    # Hotfix branches
```

### **Commit Convention**
```
type(scope): description

feat(auth): add JWT token validation
fix(api): resolve user creation error
docs(readme): update installation guide
style(ui): improve button styling
refactor(db): optimize user queries
test(auth): add login tests
```

### **Pull Request Process**
1. Create feature branch from `develop`
2. Make changes with tests
3. Run linting and tests
4. Create pull request
5. Code review
6. Merge to `develop`
7. Deploy to staging
8. Merge to `main` for production

---

## 🐛 **Debugging**

### **Backend Debugging**
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Use debugger
node --inspect dist/server.js

# VS Code debugging
# Add to launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Server",
  "program": "${workspaceFolder}/server/dist/server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### **Frontend Debugging**
```bash
# React Developer Tools
# Install browser extension

# Console debugging
console.log('Debug info:', data);

# React DevTools
# Use React Developer Tools extension
```

### **Database Debugging**
```bash
# MongoDB Compass
# Connect to: mongodb://localhost:27017/hacklahoma2026_dev

# Command line
mongosh
use hacklahoma2026_dev
db.users.find()
```

---

## 📊 **Performance Optimization**

### **Frontend Optimization**
```typescript
// Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Memoization
const MemoizedComponent = React.memo(Component);

// UseCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

### **Backend Optimization**
```typescript
// Database indexing
userSchema.index({ email: 1 });
userSchema.index({ role: 1, createdAt: -1 });

// Query optimization
const users = await User.find({ role: 'hacker' })
  .select('firstName lastName email')
  .limit(10)
  .sort({ createdAt: -1 });
```

---

## 🔒 **Security Best Practices**

### **Input Validation**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  firstName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
});

const validateUser = (data: unknown) => {
  return userSchema.parse(data);
};
```

### **Authentication Security**
```typescript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 12);

// JWT token validation
const decoded = jwt.verify(token, process.env.JWT_SECRET);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
```

---

## 📚 **Documentation**

### **Code Documentation**
```typescript
/**
 * User service for managing user operations
 * @class UserService
 */
export class UserService {
  /**
   * Create a new user
   * @param userData - User data object
   * @returns Promise<IUser> - Created user
   * @throws {Error} When user creation fails
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    // Implementation
  }
}
```

### **API Documentation**
```typescript
/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Public
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Object} Created user object
 */
```

---

## 🚀 **Deployment**

### **Development Deployment**
```bash
# Start all services
./start-all.sh

# Or individually
cd server && npm run dev
cd frontend && npm run dev
cd server/admin-gui && npm start
```

### **Production Deployment**
```bash
# Build applications
cd server && npm run build
cd frontend && npm run build

# Start production server
cd server && npm start
```

---

## 🤝 **Contributing**

### **Getting Started**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Code Review Process**
1. Automated checks must pass
2. Code review by team member
3. All tests must pass
4. Documentation updated if needed

### **Issue Reporting**
- Use GitHub issues
- Include reproduction steps
- Provide environment details
- Add relevant logs

---

## 📞 **Support**

### **Getting Help**
- Check documentation first
- Search existing issues
- Ask in team chat
- Create new issue if needed

### **Resources**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**🏈 This development guide ensures consistent, high-quality code and smooth collaboration for the Hacklahoma 2026 platform.**
