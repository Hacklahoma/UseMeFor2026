# 🐝 Hacklahoma Admin GUI - Usage Guide

## 🚀 Quick Start

### 1. Start the Servers

**Main API Server (Required):**
```bash
cd server
npm run dev
```
*Runs on port 5001*

**Admin GUI Server:**
```bash
cd server/admin-gui
npm start
```
*Runs on port 5002*

### 2. Access the Admin Interface

1. Open your browser to: **http://localhost:5002**
2. Enter the admin secret: `hacklahoma-admin-2026`
3. Click "🔐 Authenticate"

---

## 🎯 Features Overview

### 📊 Dashboard Tab
- **Real-time Statistics**: User counts, database size
- **System Information**: Server details, memory usage, uptime
- **Quick Actions**: One-click access to common tasks

### 👥 Users Tab
- **Create New Users**: Beautiful form with validation
- **User Management Table**: View, edit, and manage all users
- **User Statistics**: Current metrics and growth

### 🗄️ Database Tab
- **Database Statistics**: Collections, documents, size
- **Seeding Tools**: Add sample data for testing
- **Database Operations**: Clear database with safety confirmations

### 🎭 Impersonate Tab
- **Quick Role Impersonation**: Generate tokens for hacker/staff roles
- **Specific User Impersonation**: Select any user to impersonate
- **Token Management**: Copy JWT tokens for API testing

---

## 🔧 Common Tasks

### Creating Test Users

1. Go to **Users** tab
2. Fill out the "Create New User" form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@university.edu`
   - Role: `hacker` or `staff`
   - School: `University of Oklahoma`
   - Major: `Computer Science`
3. Click **"➕ Create User"**

### Seeding Sample Data

1. Go to **Database** tab
2. Choose your seeding option:
   - **🌱 Seed Sample Users**: Adds 10 sample users
   - **🚀 Seed All Data**: Full database with realistic data
3. Confirm the operation
4. Wait for success message

### Impersonating Users for Testing

**Quick Role Impersonation:**
1. Go to **Impersonate** tab
2. Click **"🎒 Impersonate Hacker"** or **"👨‍💼 Impersonate Staff"**
3. Copy the generated JWT token
4. Use in API requests: `Authorization: Bearer <token>`

**Specific User Impersonation:**
1. Go to **Impersonate** tab
2. Find the user in the table
3. Click **"Impersonate"** button
4. Copy the JWT token from the modal

### Clearing Database (Dangerous!)

1. Go to **Database** tab
2. Click **"🗑️ Clear Database"**
3. Type exactly: `DELETE ALL DATA`
4. Confirm the operation

---

## 🔒 Security Features

### Multi-Layer Protection
- **Environment Check**: Automatically disabled in production
- **Admin Secret**: Required for authentication
- **Session Management**: Secure sessions with timeout
- **Rate Limiting**: Prevents abuse
- **IP Whitelisting**: Optional IP restrictions

### Security Configuration
```bash
# Environment Variables
ADMIN_GUI_ENABLED=true          # Master switch
ADMIN_GUI_SECRET=your-secret    # Change this!
SESSION_SECRET=session-secret   # Change this!
ALLOWED_IPS=192.168.1.100      # Optional IP whitelist
```

---

## 🎨 Interface Guide

### Navigation
- **Header Tabs**: Switch between Dashboard, Users, Database, Impersonate
- **Status Indicator**: Shows system health (green dot = healthy)
- **Refresh Button**: Reload current tab data
- **Logout Button**: End session and return to login

### Visual Elements
- **Cards**: Glassmorphism design with hover effects
- **Tables**: Sortable, searchable, with pagination
- **Forms**: Real-time validation and feedback
- **Alerts**: Success/warning/error notifications
- **Modals**: Detailed information and confirmations

### Responsive Design
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Touch-optimized with condensed interface
- **Mobile**: Essential functions only for emergency access

---

## 🔧 API Integration

### Authentication Flow
```javascript
// 1. Login to get session
POST /auth/login
{
  "adminSecret": "hacklahoma-admin-2026"
}

// 2. Access protected endpoints
GET /api/dashboard/stats
// (session cookie automatically included)
```

### Available Endpoints
```
Authentication:
POST /auth/login          # Login with admin secret
POST /auth/logout         # End session

Dashboard:
GET  /api/dashboard/stats # Database statistics
GET  /api/dashboard/health # System health
GET  /api/system-info     # Server information

Users:
GET  /api/users          # List all users
POST /api/users          # Create new user

Database:
POST /api/database/seed-users  # Seed sample users
POST /api/database/seed-all    # Seed all data
POST /api/database/clear       # Clear database

Impersonation:
POST /api/impersonate/user/:id    # Impersonate specific user
POST /api/impersonate/role/:role  # Impersonate by role
```

---

## 🐛 Troubleshooting

### Common Issues

**"Connection Error" on Login**
- Check if Admin GUI server is running on port 5002
- Verify the admin secret is correct
- Check browser console for errors

**"Failed to load data" Messages**
- Ensure main API server is running on port 5001
- Check if MongoDB is connected
- Verify API endpoints are accessible

**Features Not Working**
- Some features require both servers to be running
- Check that environment variables are set correctly
- Look at server logs for error messages

### Testing Connectivity

**Test Admin GUI Server:**
```bash
curl http://localhost:5002/health
```

**Test Main API Server:**
```bash
curl http://localhost:5001/health
```

**Test Authentication:**
```bash
curl -X POST http://localhost:5002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"adminSecret":"hacklahoma-admin-2026"}'
```

### Log Locations
- **Admin GUI Logs**: Console output from `npm start`
- **Main API Logs**: Console output from `npm run dev`
- **Browser Logs**: Developer Tools → Console

---

## 🎯 Best Practices

### Development Workflow
1. **Start Both Servers**: Main API + Admin GUI
2. **Seed Test Data**: Use seeding tools for realistic testing
3. **Test User Flows**: Use impersonation for different roles
4. **Monitor Logs**: Keep console windows open for debugging
5. **Regular Cleanup**: Clear test data when needed

### Security Guidelines
- **Never use in production** with `ADMIN_GUI_ENABLED=true`
- **Change default secrets** in production environments
- **Use IP whitelisting** for additional security
- **Monitor access logs** for suspicious activity
- **Regular security updates** for dependencies

### Performance Tips
- **Auto-refresh**: Dashboard updates every 30 seconds
- **Caching**: API responses cached for 30 seconds
- **Pagination**: Large tables automatically paginated
- **Lazy Loading**: Data loaded only when tabs are accessed

---

## 🚀 Advanced Usage

### Custom Seeding
```javascript
// Create custom seed data
POST /api/users
{
  "firstName": "Custom",
  "lastName": "User",
  "email": "custom@example.com",
  "role": "hacker",
  "school": "Custom University",
  "major": "Custom Major"
}
```

### Bulk Operations
- Use the Users tab to manage multiple users
- Export user data (feature coming soon)
- Bulk role changes (feature coming soon)

### API Testing
- Use impersonation tokens in Postman/curl
- Test different user roles and permissions
- Validate API responses and error handling

---

## 📞 Support

### Getting Help
- Check this usage guide first
- Look at server console logs
- Test basic connectivity with curl commands
- Review the main README.md for architecture details

### Reporting Issues
- Include server logs and error messages
- Specify which browser and version
- Describe steps to reproduce the issue
- Note which servers are running

---

**🎉 Happy admin-ing with the Hacklahoma Admin GUI!**

*This interface is designed to make database management beautiful and efficient for the tech team.*
