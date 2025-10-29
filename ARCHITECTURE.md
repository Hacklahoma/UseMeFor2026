# 🏗️ Hacklahoma 2026 - System Architecture

> Comprehensive technical architecture documentation for the Hacklahoma 2026 hackathon platform

---

## 🎯 **System Overview**

The Hacklahoma 2026 platform is a full-stack web application designed to support both hackathon participants (hackers) and event staff (exec) with separate, role-based interfaces. The system consists of three main components:

1. **Frontend Application** (React + TypeScript)
2. **Backend API Server** (Node.js + Express + MongoDB)
3. **Admin GUI** (Express + HTML/CSS/JS)

---

## 🏛️ **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  Admin GUI (HTML/JS)  │  Mobile PWA    │
│  Port: 3000          │  Port: 5002           │  (Future)      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                             │
├─────────────────────────────────────────────────────────────────┤
│  Main API Server (Express)    │  Admin API Proxy               │
│  Port: 5001                   │  (Built into Admin GUI)        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Atlas (Production)   │  MongoDB Local (Development)   │
│  Session Store (In-Memory)    │  File System (Logs)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Frontend Architecture**

### **Technology Stack**
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 4.9.5** - Type-safe development
- **Tailwind CSS 3.4.0** - Utility-first styling
- **React Scripts 5.0.1** - Build and development tools
- **Motion** - Animation library

### **Project Structure**
```
frontend/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── index.tsx              # Application entry point
│   ├── index.css              # Global styles with Tailwind
│   ├── types/
│   │   └── images.d.ts        # Image type declarations
│   └── ui/
│       ├── common/
│       │   └── assets/        # Static assets (19 files)
│       └── pages/
│           ├── about/         # About page components
│           ├── exec/          # Staff/Executive interface
│           ├── hacker/        # Participant interface
│           ├── landing/       # Landing page (6 files)
│           └── login/         # Authentication pages
├── public/
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   └── BeeLogo.ico           # Favicon
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

### **Key Features**
- **Responsive Design** - Mobile-first approach
- **Component-Based Architecture** - Reusable UI components
- **Type Safety** - Full TypeScript implementation
- **Modern React Patterns** - Hooks, functional components
- **PWA Ready** - Service worker and manifest configured

---

## ⚙️ **Backend Architecture**

### **Technology Stack**
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **TypeScript 5.2.2** - Type-safe development
- **MongoDB 8.10.1** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### **Project Structure**
```
server/
├── src/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Server startup and configuration
│   ├── config/
│   │   ├── index.ts          # Configuration management
│   │   └── logger.ts         # Logging system
│   ├── db/
│   │   ├── connect.ts        # Database connection
│   │   ├── models/
│   │   │   ├── User.ts       # User data model
│   │   │   └── index.ts      # Model exports
│   │   └── seeds/
│   │       └── seed-dev.ts   # Development data seeding
│   ├── auth/
│   │   ├── tokens.ts         # JWT token management
│   │   ├── password.ts       # Password hashing and validation
│   │   ├── sessionStore.ts   # Session management
│   │   └── middleware/
│   │       ├── requireAuth.ts        # Authentication middleware
│   │       ├── requireRole.ts        # Role-based access control
│   │       ├── requirePermission.ts  # Permission-based access
│   │       ├── rateLimit.ts          # Rate limiting
│   │       └── suspiciousActivity.ts # Security monitoring
│   ├── modules/
│   │   ├── auth/             # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.router.ts
│   │   │   └── auth.types.ts
│   │   └── users/            # User management module
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.router.ts
│   │       └── user.types.ts
│   ├── admin-tool/
│   │   └── index.ts          # Admin tool API endpoints
│   └── utils/
│       ├── errors.ts         # Error handling utilities
│       ├── http.ts           # HTTP utilities
│       ├── validation.ts     # Input validation
│       └── index.ts          # Utility exports
├── test/                     # Test suite
│   ├── fixtures/            # Test data
│   ├── integration/         # Integration tests
│   ├── unit/               # Unit tests
│   └── setup.ts            # Test configuration
├── dist/                    # Compiled JavaScript output
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── jest.config.ts          # Testing configuration
├── .eslintrc.js            # Linting rules
└── start-all.sh            # Development startup script
```

### **Key Features**
- **Modular Architecture** - Feature-based module organization
- **Type Safety** - Full TypeScript implementation
- **Security First** - Multiple layers of security
- **Scalable Design** - Easy to extend and maintain
- **Comprehensive Testing** - Unit, integration, and E2E tests

---

## 🎛️ **Admin GUI Architecture**

### **Technology Stack**
- **Express.js** - Web server
- **HTML5/CSS3/JavaScript** - Frontend technologies
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client for API calls
- **Session Management** - Express sessions

### **Project Structure**
```
server/admin-gui/
├── server.js                # Express server for admin GUI
├── public/
│   ├── css/
│   │   └── admin.css       # Custom admin styles
│   ├── js/
│   │   └── admin.js        # Frontend JavaScript
│   └── images/             # Admin GUI assets
├── views/
│   ├── dashboard.html      # Main admin dashboard
│   └── login.html          # Admin login page
├── package.json            # Dependencies
├── README.md              # Admin GUI documentation
├── USAGE.md               # Usage guide
└── env.example            # Environment configuration
```

### **Key Features**
- **Beautiful UI** - Modern, responsive design
- **Real-time Updates** - Live data refresh
- **Security** - Multi-layer authentication
- **Database Management** - Complete CRUD operations
- **User Impersonation** - Testing and debugging tools

---

## 🗄️ **Database Architecture**

### **MongoDB Collections**

#### **Users Collection**
```typescript
interface IUser {
  firstName: string;           // Required, max 50 chars
  lastName: string;            // Required, max 50 chars
  email: string;              // Required, unique, validated
  password: string;           // Required, hashed, min 8 chars
  school?: string;            // Optional, max 100 chars
  major?: string;             // Optional, max 100 chars
  grade?: string;             // Optional, max 50 chars
  role: UserRole;             // 'hacker' | 'staff'
  profilePicture?: string;    // Optional URL
  socialLinks: {              // Social media links
    github?: string;
    linkedin?: string;
    discord?: string;
    instagram?: string;
  };
  createdAt: Date;           // Auto-generated
  updatedAt: Date;           // Auto-generated
}
```

#### **Sessions Collection**
```typescript
interface ISession {
  userId: string;             // Reference to user
  sessionId: string;          // Unique session identifier
  refreshTokenId: string;     // JWT refresh token ID
  ip: string;                // Client IP address
  userAgent: string;          // Client user agent
  isRevoked: boolean;         // Session revocation status
  revokedAt?: Date;          // Revocation timestamp
  createdAt: Date;           // Session creation time
  updatedAt: Date;           // Last update time
}
```

### **Database Indexes**
- **Users**: `email` (unique), `role`, `createdAt`
- **Sessions**: `userId + isRevoked`, `sessionId + isRevoked`, `createdAt` (TTL)

---

## 🔐 **Security Architecture**

### **Authentication Flow**
1. **User Registration/Login** → Password hashing (bcrypt)
2. **JWT Token Generation** → Access token (15min) + Refresh token (7d)
3. **Session Creation** → Server-side session tracking
4. **Token Validation** → Middleware checks on protected routes
5. **Session Management** → Revocation and cleanup

### **Security Layers**
1. **Network Security**
   - CORS configuration
   - Rate limiting
   - IP whitelisting (admin GUI)

2. **Application Security**
   - Helmet security headers
   - Input validation (Zod)
   - Password strength requirements
   - Suspicious activity monitoring

3. **Data Security**
   - Password hashing (bcrypt, 12 rounds)
   - JWT token encryption
   - Session revocation
   - Data sanitization

4. **Environment Security**
   - Environment variable protection
   - Development-only features
   - Production safety checks

---

## 🚀 **Deployment Architecture**

### **Development Environment**
- **Frontend**: `http://localhost:3000` (React dev server)
- **Backend**: `http://localhost:5001` (Node.js + Express)
- **Admin GUI**: `http://localhost:5002` (Express + HTML)
- **Database**: MongoDB local instance

### **Production Environment**
- **Frontend**: Static build served by CDN/web server
- **Backend**: Node.js process with PM2/process manager
- **Admin GUI**: Disabled in production (security)
- **Database**: MongoDB Atlas (cloud)

### **Environment Configuration**
```bash
# Development
NODE_ENV=development
PORT=5001
MONGODB_URI_DEV=mongodb://localhost:27017/hacklahoma2026_dev

# Production
NODE_ENV=production
PORT=5001
MONGODB_URI_PROD=mongodb+srv://user:pass@cluster.mongodb.net/hacklahoma2026
```

---

## 📊 **Performance Considerations**

### **Frontend Optimization**
- **Code Splitting** - Route-based lazy loading
- **Bundle Optimization** - Tree shaking and minification
- **Caching** - Browser caching and service worker
- **Responsive Images** - Optimized asset delivery

### **Backend Optimization**
- **Database Indexing** - Optimized queries
- **Connection Pooling** - MongoDB connection management
- **Caching** - Session and data caching
- **Rate Limiting** - Request throttling

### **Database Optimization**
- **Indexes** - Strategic indexing for common queries
- **TTL Indexes** - Automatic cleanup of old sessions
- **Connection Pooling** - Efficient connection management
- **Query Optimization** - Efficient aggregation pipelines

---

## 🔄 **Data Flow**

### **User Registration Flow**
1. Frontend → POST `/api/auth/register`
2. Backend → Validate input, hash password
3. Database → Create user document
4. Backend → Generate JWT tokens
5. Frontend → Store tokens, redirect to dashboard

### **User Login Flow**
1. Frontend → POST `/api/auth/login`
2. Backend → Validate credentials
3. Database → Verify user exists
4. Backend → Generate JWT tokens, create session
5. Frontend → Store tokens, redirect to dashboard

### **Admin Operations Flow**
1. Admin GUI → POST `/api/database/seed-users`
2. Admin GUI → Proxy to main API
3. Main API → Execute database operations
4. Main API → Return results
5. Admin GUI → Display results to user

---

## 🧪 **Testing Architecture**

### **Test Types**
- **Unit Tests** - Individual function/component testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Security Tests** - Authentication and authorization testing

### **Test Structure**
```
test/
├── fixtures/           # Test data and mocks
├── integration/        # API integration tests
├── unit/              # Unit tests by module
│   └── auth/          # Authentication tests
├── setup.ts           # Test configuration
└── tsconfig.json      # Test TypeScript config
```

---

## 📈 **Monitoring and Logging**

### **Logging Levels**
- **ERROR** - Critical errors requiring attention
- **WARN** - Warning conditions
- **INFO** - General information
- **DEBUG** - Detailed debugging information

### **Monitoring Points**
- **Application Health** - Server status and performance
- **Database Health** - Connection status and query performance
- **Security Events** - Authentication failures, suspicious activity
- **User Activity** - Registration, login, and usage patterns

---

## 🔧 **Development Workflow**

### **Local Development**
1. **Start MongoDB** - Local database instance
2. **Start Backend** - `npm run dev` in server directory
3. **Start Frontend** - `npm run dev` in frontend directory
4. **Start Admin GUI** - `npm start` in admin-gui directory

### **Code Quality**
- **TypeScript** - Strict type checking
- **ESLint** - Code linting and formatting
- **Jest** - Unit and integration testing
- **Prettier** - Code formatting (recommended)

### **Git Workflow**
- **Feature Branches** - New features in separate branches
- **Pull Requests** - Code review process
- **CI/CD** - Automated testing and deployment
- **Version Control** - Semantic versioning

---

## 🚀 **Future Enhancements**

### **Planned Features**
- **PWA Support** - Progressive Web App capabilities
- **Real-time Updates** - WebSocket integration
- **Mobile App** - React Native or Flutter
- **Advanced Analytics** - User behavior tracking
- **Microservices** - Service-oriented architecture

### **Scalability Considerations**
- **Horizontal Scaling** - Load balancing and clustering
- **Database Sharding** - Data distribution strategies
- **Caching Layer** - Redis for session and data caching
- **CDN Integration** - Global content delivery

---

**🏈 This architecture provides a solid foundation for the Hacklahoma 2026 platform, ensuring scalability, security, and maintainability for the University of Oklahoma's premier hackathon event.**
