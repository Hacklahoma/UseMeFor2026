# 🔌 Hacklahoma 2026 - API Documentation

> Comprehensive API documentation for the Hacklahoma 2026 backend services

---

## 🌐 **Base URLs**

- **Main API Server**: `http://localhost:5001`
- **Admin GUI**: `http://localhost:5002`
- **Frontend**: `http://localhost:3000`

---

## 🔐 **Authentication**

### **Authentication Methods**
- **JWT Access Tokens** - Short-lived (15 minutes)
- **JWT Refresh Tokens** - Long-lived (7 days), httpOnly cookies
- **Session Management** - Server-side session tracking

### **Token Format**
```json
{
  "sub": "user_id",
  "role": "hacker|staff",
  "perms": ["permission1", "permission2"],
  "sid": "session_id",
  "impersonated": false,
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 📋 **API Endpoints**

### **Health Check**

#### `GET /health`
Check server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## 🔑 **Authentication Endpoints**

### **User Registration**

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "SecurePass123!",
  "school": "University of Oklahoma",
  "major": "Computer Science",
  "grade": "Junior",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": "hacker",
    "school": "University of Oklahoma",
    "major": "Computer Science",
    "grade": "Junior",
    "socialLinks": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email already exists
- `500` - Server error

### **User Login**

#### `POST /api/auth/login`
Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "john.doe@university.edu",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": "hacker"
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  }
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Authentication failed
- `429` - Too many attempts

### **Token Refresh**

#### `POST /api/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_jwt_access_token",
  "expiresIn": 900
}
```

### **User Logout**

#### `POST /api/auth/logout`
Logout user and revoke session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👥 **User Management Endpoints**

### **Get Current User**

#### `GET /api/users/me`
Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": "hacker",
    "school": "University of Oklahoma",
    "major": "Computer Science",
    "grade": "Junior",
    "profilePicture": "",
    "socialLinks": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe",
      "discord": "",
      "instagram": ""
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Get User by ID**

#### `GET /api/users/:id`
Get user profile by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": "hacker",
    "school": "University of Oklahoma",
    "major": "Computer Science",
    "grade": "Junior",
    "profilePicture": "",
    "socialLinks": {
      "github": "https://github.com/johndoe",
      "linkedin": "https://linkedin.com/in/johndoe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Get All Users (Staff Only)**

#### `GET /api/users`
Get list of all users (requires staff role).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `role` (optional) - Filter by role (hacker|staff)
- `search` (optional) - Search by name or email

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "role": "hacker",
      "school": "University of Oklahoma",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### **Update User (Staff Only)**

#### `PUT /api/users/:id`
Update user profile (requires staff role).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "school": "University of Oklahoma",
  "major": "Computer Science",
  "grade": "Senior",
  "role": "hacker",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": "hacker",
    "school": "University of Oklahoma",
    "major": "Computer Science",
    "grade": "Senior",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Delete User (Staff Only)**

#### `DELETE /api/users/:id`
Delete user account (requires staff role).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 🎛️ **Admin Tool Endpoints**

> **⚠️ Development Only** - These endpoints are only available when `ENABLE_ADMIN_TOOL=true`

### **Admin Health Check**

#### `GET /admin/health`
Check admin tool status.

**Response:**
```json
{
  "status": "Admin tool active",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **Database Statistics**

#### `GET /admin/database-stats`
Get comprehensive database statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "hackers": 140,
      "staff": 10
    },
    "collections": {
      "users": 150
    },
    "database": {
      "size": 1048576,
      "storageSize": 2097152,
      "collections": 2,
      "documents": 150,
      "indexes": 5
    }
  }
}
```

### **System Information**

#### `GET /admin/system-info`
Get server system information.

**Response:**
```json
{
  "success": true,
  "systemInfo": {
    "nodeVersion": "v18.17.0",
    "platform": "darwin",
    "uptime": 3600,
    "memoryUsage": {
      "rss": 50331648,
      "heapTotal": 20971520,
      "heapUsed": 15728640,
      "external": 1048576
    },
    "environment": "development",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "database": {
      "connected": true,
      "uri": "Connected to Atlas",
      "dbName": "hacklahoma2026_dev"
    }
  }
}
```

### **Seed Sample Users**

#### `POST /admin/seed-users`
Create sample users for development/testing.

**Response:**
```json
{
  "success": true,
  "message": "User seeding completed",
  "results": {
    "created": 6,
    "skipped": 0,
    "errors": []
  }
}
```

### **Seed All Data**

#### `POST /admin/seed-all`
Seed complete database with all sample data.

**Response:**
```json
{
  "success": true,
  "message": "Full database seeding completed",
  "results": {
    "users": {
      "created": 6,
      "skipped": 0,
      "errors": []
    }
  }
}
```

### **Clear Database**

#### `POST /admin/clear-database`
⚠️ **DANGEROUS** - Clear all data from database.

**Response:**
```json
{
  "success": true,
  "message": "Database cleared successfully",
  "results": {
    "deletedCollections": ["users"],
    "deletedCounts": {
      "users": 150
    }
  }
}
```

### **Create User (Admin)**

#### `POST /admin/users`
Create a new user via admin interface.

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@hacklahoma.org",
  "password": "Admin123!",
  "role": "staff",
  "school": "University of Oklahoma",
  "major": "Computer Science"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@hacklahoma.org",
    "role": "staff",
    "school": "University of Oklahoma",
    "major": "Computer Science",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Update User (Admin)**

#### `PUT /admin/users/:userId`
Update user via admin interface.

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "school": "Oklahoma State University",
  "major": "Software Engineering"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "user_id",
    "firstName": "Updated",
    "lastName": "Name",
    "email": "user@example.com",
    "role": "hacker",
    "school": "Oklahoma State University",
    "major": "Software Engineering",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **Get All Users (Admin)**

#### `GET /admin/users`
Get all users for admin interface.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@university.edu",
      "role": "hacker",
      "school": "University of Oklahoma",
      "major": "Computer Science",
      "grade": "Junior",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### **User Impersonation**

#### `POST /admin/impersonate/:userId`
Generate impersonation token for specific user.

**Response:**
```json
{
  "success": true,
  "message": "Impersonating user: John Doe (john.doe@university.edu)",
  "accessToken": "jwt_impersonation_token",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": "hacker"
  },
  "impersonated": true
}
```

#### `POST /admin/impersonate/role/:role`
Generate impersonation token for role (hacker|staff).

**Response:**
```json
{
  "success": true,
  "message": "Impersonating hacker: Jane Smith (jane.smith@okstate.edu)",
  "accessToken": "jwt_impersonation_token",
  "user": {
    "id": "user_id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@okstate.edu",
    "role": "hacker"
  },
  "impersonated": true
}
```

---

## 🎨 **Admin GUI Endpoints**

> **Admin GUI** runs on port 5002 and proxies requests to the main API

### **Admin GUI Authentication**

#### `POST /auth/login`
Login to admin GUI.

**Request Body:**
```json
{
  "adminSecret": "hacklahoma-admin-2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful"
}
```

#### `POST /auth/logout`
Logout from admin GUI.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### **Admin GUI API Proxies**

All admin GUI endpoints proxy to the main API:

- `GET /api/dashboard/stats` → `GET /admin/database-stats`
- `GET /api/dashboard/health` → `GET /admin/health`
- `GET /api/system-info` → `GET /admin/system-info`
- `GET /api/users` → `GET /admin/users`
- `POST /api/users` → `POST /admin/users`
- `PUT /api/users/:userId` → `PUT /admin/users/:userId`
- `POST /api/database/seed-users` → `POST /admin/seed-users`
- `POST /api/database/seed-all` → `POST /admin/seed-all`
- `POST /api/database/clear` → `POST /admin/clear-database`
- `POST /api/impersonate/user/:userId` → `POST /admin/impersonate/:userId`
- `POST /api/impersonate/role/:role` → `POST /admin/impersonate/role/:role`

---

## 📊 **Error Responses**

### **Standard Error Format**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### **HTTP Status Codes**

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `409` | Conflict |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

### **Common Error Codes**

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_FAILED` | Invalid credentials |
| `TOKEN_EXPIRED` | JWT token expired |
| `INVALID_TOKEN` | Invalid JWT token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `USER_NOT_FOUND` | User does not exist |
| `EMAIL_ALREADY_EXISTS` | Email already registered |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## 🔒 **Rate Limiting**

### **Global Rate Limits**
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### **Authentication Rate Limits**
- **Window**: 15 minutes
- **Limit**: 5 requests per IP
- **Applies to**: `/api/auth/login`, `/api/auth/register`

### **Rate Limit Response**
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": 900
}
```

---

## 🛡️ **Security Headers**

### **Security Headers Applied**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`

---

## 📝 **Request/Response Examples**

### **Complete Registration Flow**

1. **Register User**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@ou.edu",
    "password": "SecurePass123!",
    "school": "University of Oklahoma",
    "major": "Computer Science"
  }'
```

2. **Login User**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@ou.edu",
    "password": "SecurePass123!"
  }'
```

3. **Access Protected Resource**
```bash
curl -X GET http://localhost:5001/api/users/me \
  -H "Authorization: Bearer <access_token>"
```

### **Admin Operations**

1. **Login to Admin GUI**
```bash
curl -X POST http://localhost:5002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminSecret": "hacklahoma-admin-2026"
  }'
```

2. **Seed Sample Data**
```bash
curl -X POST http://localhost:5002/api/database/seed-users \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<session_cookie>"
```

3. **Get Database Stats**
```bash
curl -X GET http://localhost:5002/api/dashboard/stats \
  -H "Cookie: connect.sid=<session_cookie>"
```

---

## 🔧 **Development Tools**

### **API Testing with Postman**
Import the following collection for easy API testing:

```json
{
  "info": {
    "name": "Hacklahoma 2026 API",
    "description": "Complete API collection for Hacklahoma 2026"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5001"
    },
    {
      "key": "adminUrl",
      "value": "http://localhost:5002"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ]
}
```

### **Environment Variables for Testing**
```bash
# Main API
export API_BASE_URL="http://localhost:5001"
export ADMIN_GUI_URL="http://localhost:5002"
export ADMIN_SECRET="hacklahoma-admin-2026"

# Test User
export TEST_EMAIL="test@hacklahoma.org"
export TEST_PASSWORD="TestPass123!"
```

---

**🏈 This API documentation provides comprehensive coverage of all endpoints and functionality for the Hacklahoma 2026 platform.**
