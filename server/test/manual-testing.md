# Manual Testing Guide for Admin Tool

This document contains the manual tests that were performed during development and can be used for regression testing.

## Prerequisites

1. Server running: `npm run dev`
2. MongoDB Atlas connected
3. Admin tool enabled: `ENABLE_ADMIN_TOOL=on`

## Admin Tool Endpoints

### 1. Health Check
```bash
curl -s http://localhost:5001/admin/health
```
**Expected Response:**
```json
{
  "status": "Admin tool active",
  "environment": "development", 
  "timestamp": "2025-10-08T01:49:40.163Z"
}
```

### 2. Database Seeding

#### Seed Sample Users
```bash
curl -s -X POST http://localhost:5001/admin/seed-users
```
**Expected Response:**
```json
{
  "success": true,
  "message": "User seeding completed",
  "results": {
    "created": 7,
    "skipped": 0,
    "errors": []
  }
}
```

#### Seed All Data
```bash
curl -s -X POST http://localhost:5001/admin/seed-all
```

#### Clear Database (⚠️ DESTRUCTIVE)
```bash
curl -s -X POST http://localhost:5001/admin/clear-database
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Database cleared successfully",
  "results": {
    "deletedCollections": ["users"],
    "deletedCounts": {
      "users": 7
    }
  }
}
```

### 3. Database Statistics
```bash
curl -s http://localhost:5001/admin/database-stats
```
**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 7,
      "hackers": 5,
      "staff": 2
    },
    "collections": {
      "users": 7
    }
  }
}
```

### 4. User Management

#### List All Users
```bash
curl -s http://localhost:5001/admin/users
```
**Expected Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "68e5c33e6fe4b98fc4482787",
      "firstName": "David",
      "lastName": "Wilson",
      "email": "david.w@nsu.edu",
      "role": "hacker",
      "school": "Northeastern State University",
      "major": "Computer Information Systems",
      "grade": "Junior",
      "createdAt": "2025-10-08T01:49:50.749Z"
    }
    // ... more users
  ]
}
```

#### Create Custom User
```bash
curl -s -X POST http://localhost:5001/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "hacker",
    "school": "Test University"
  }'
```

### 5. User Impersonation

#### Impersonate by Role - Staff
```bash
curl -s -X POST http://localhost:5001/admin/impersonate/role/staff
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Impersonating staff: Admin User (admin@hacklahoma.org)",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68e5c33b6fe4b98fc4482775",
    "firstName": "Admin",
    "lastName": "User", 
    "email": "admin@hacklahoma.org",
    "role": "staff"
  },
  "impersonated": true
}
```

#### Impersonate by Role - Hacker
```bash
curl -s -X POST http://localhost:5001/admin/impersonate/role/hacker
```

#### Impersonate Specific User
```bash
# First get user ID from /admin/users, then:
curl -s -X POST http://localhost:5001/admin/impersonate/68e5c33c6fe4b98fc448277b
```

### 6. System Information
```bash
curl -s http://localhost:5001/admin/system-info
```
**Expected Response:**
```json
{
  "success": true,
  "systemInfo": {
    "nodeVersion": "v23.11.0",
    "platform": "darwin",
    "uptime": 78.025719875,
    "memory": {
      "rss": 61407232,
      "heapTotal": 28033024,
      "heapUsed": 25008512,
      "external": 20799912,
      "arrayBuffers": 18391470
    },
    "environment": "development",
    "timestamp": "2025-10-08T01:50:44.978Z",
    "database": {
      "connected": true,
      "uri": "Connected to Atlas"
    }
  }
}
```

## Using JWT Tokens for Authentication

### How to Use Impersonation Tokens

1. **Get an impersonation token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5001/admin/impersonate/role/staff | jq -r '.accessToken')
```

2. **Use the token in API requests:**
```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/users/me
```

3. **Verify token contains impersonation flag:**
```bash
# Decode JWT (you can use jwt.io or a JWT decoder)
echo $TOKEN | cut -d'.' -f2 | base64 -d
# Should contain: "impersonated": true
```

### Sample Users Created by Seeding

**Staff Users:**
- `admin@hacklahoma.org` - Admin User (University of Oklahoma)
- `staff@hacklahoma.org` - Staff Member (Oklahoma State University)

**Hacker Users:**
- `john.doe@student.ou.edu` - John Doe (OU Computer Science)
- `jane.smith@okstate.edu` - Jane Smith (OSU Software Engineering)
- `alex.j@tulsau.edu` - Alex Johnson (University of Tulsa Cybersecurity)
- `maria.garcia@uco.edu` - Maria Garcia (UCO Data Science)
- `david.w@nsu.edu` - David Wilson (NSU Computer Information Systems)

All users have password: `Hacker123!` or `Staff123!` or `Admin123!`

## Error Cases to Test

### Invalid Role
```bash
curl -s -X POST http://localhost:5001/admin/impersonate/role/invalid
# Should return 400 error
```

### Non-existent User
```bash
curl -s -X POST http://localhost:5001/admin/impersonate/507f1f77bcf86cd799439011
# Should return 404 error
```

### Duplicate User Creation
```bash
# Create user twice with same email
curl -s -X POST http://localhost:5001/admin/users -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"duplicate@test.com","password":"Test123!"}'
curl -s -X POST http://localhost:5001/admin/users -H "Content-Type: application/json" -d '{"firstName":"Test","lastName":"User","email":"duplicate@test.com","password":"Test123!"}'
# Second should return 400 error
```

## Performance Testing

### Load Testing Seeding
```bash
# Test multiple concurrent seeding requests
for i in {1..5}; do
  curl -s -X POST http://localhost:5001/admin/seed-users &
done
wait
# Should handle concurrent requests gracefully
```

## Security Testing

### Production Environment Check
```bash
# Set NODE_ENV=production and verify admin routes are disabled
NODE_ENV=production npm run dev
curl -s http://localhost:5001/admin/health
# Should return empty response or 404
```

### Admin Tool Disabled Check
```bash
# Set ENABLE_ADMIN_TOOL=off and verify routes are disabled
ENABLE_ADMIN_TOOL=off npm run dev  
curl -s http://localhost:5001/admin/health
# Should return warning message
```
