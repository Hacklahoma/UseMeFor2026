# 🔧 Hacklahoma 2026 - Troubleshooting Guide

> Comprehensive troubleshooting guide for common issues and solutions

---

## 🎯 **Quick Reference**

### **Common Issues**
- [Port Already in Use](#port-already-in-use)
- [Database Connection Issues](#database-connection-issues)
- [Authentication Problems](#authentication-problems)
- [Build/Compilation Errors](#buildcompilation-errors)
- [Environment Configuration](#environment-configuration)
- [Admin GUI Issues](#admin-gui-issues)
- [Performance Issues](#performance-issues)

---

## 🚨 **Port Already in Use**

### **Error Message**
```
Error: listen EADDRINUSE: address already in use :::5001
```

### **Solutions**

**1. Find and Kill Process:**
```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or kill all Node processes
pkill -f node
```

**2. Use Different Port:**
```bash
# Set different port in .env
PORT=5002

# Or start with port override
PORT=5002 npm run dev
```

**3. Check for Background Processes:**
```bash
# Check for PM2 processes
pm2 list
pm2 stop all

# Check for Docker containers
docker ps
docker stop <container_id>
```

---

## 🗄️ **Database Connection Issues**

### **Error Messages**
```
MongoServerError: connection timed out
MongooseError: Operation `users.findOne()` buffering timed out
```

### **Solutions**

**1. Check MongoDB Status:**
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# or
sudo systemctl status mongod

# Start MongoDB
brew services start mongodb-community
# or
sudo systemctl start mongod
```

**2. Verify Connection String:**
```bash
# Test connection
mongosh "mongodb://localhost:27017/hacklahoma2026_dev"

# Check Atlas connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026"
```

**3. Check Network Connectivity:**
```bash
# Test network connectivity
ping cluster.mongodb.net

# Check firewall settings
sudo ufw status
```

**4. Verify Environment Variables:**
```bash
# Check .env file
cat .env | grep MONGODB_URI

# Test with different environment
NODE_ENV=development npm run dev
```

---

## 🔐 **Authentication Problems**

### **Error Messages**
```
JsonWebTokenError: invalid token
TokenExpiredError: jwt expired
```

### **Solutions**

**1. Check JWT Secrets:**
```bash
# Verify JWT secrets in .env
echo $JWT_ACCESS_SECRET
echo $JWT_REFRESH_SECRET

# Generate new secrets
openssl rand -base64 32
```

**2. Clear Browser Storage:**
```javascript
// Clear localStorage
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Clear cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

**3. Check Token Format:**
```bash
# Verify token format
echo "your_token_here" | base64 -d

# Check token expiration
node -e "console.log(new Date(JSON.parse(Buffer.from('your_token_here', 'base64').toString()).exp * 1000))"
```

**4. Regenerate Tokens:**
```bash
# Clear all sessions
curl -X POST http://localhost:5001/api/auth/logout

# Login again
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🔨 **Build/Compilation Errors**

### **TypeScript Errors**

**Error: Cannot find module**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npx tsc --noEmit
```

**Error: Property does not exist on type**
```typescript
// Add proper type definitions
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type assertion if needed
const user = data as User;
```

**Error: JSX element has no corresponding closing tag**
```tsx
// Check for unclosed tags
<div>
  <span>Content</span>
</div> // Make sure this is properly closed
```

### **React Errors**

**Error: Cannot read property of undefined**
```tsx
// Add null checks
const UserProfile = ({ user }) => {
  if (!user) return <div>Loading...</div>;
  
  return <div>{user.name}</div>;
};
```

**Error: Maximum update depth exceeded**
```tsx
// Fix infinite re-renders
const [count, setCount] = useState(0);

// Wrong - causes infinite loop
useEffect(() => {
  setCount(count + 1);
}, [count]);

// Correct - use dependency array properly
useEffect(() => {
  setCount(prev => prev + 1);
}, []);
```

### **Build Errors**

**Error: Module not found**
```bash
# Check import paths
import Component from './Component'; // Relative path
import Component from '@/components/Component'; // Absolute path

# Verify file exists
ls -la src/components/Component.tsx
```

**Error: Cannot resolve dependency**
```bash
# Install missing dependency
npm install package-name

# Check package.json
cat package.json | grep package-name
```

---

## ⚙️ **Environment Configuration**

### **Common Environment Issues**

**1. Missing Environment Variables:**
```bash
# Check if .env file exists
ls -la .env

# Copy from example
cp env.example .env

# Check environment variables
cat .env
```

**2. Wrong Environment Values:**
```bash
# Verify NODE_ENV
echo $NODE_ENV

# Set correct environment
export NODE_ENV=development

# Check all environment variables
env | grep -E "(NODE_ENV|PORT|MONGODB_URI)"
```

**3. Environment File Not Loading:**
```javascript
// Check dotenv configuration
require('dotenv').config();

// Verify in code
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
```

### **Database Environment Issues**

**1. Wrong Database URI:**
```bash
# Check MongoDB URI format
echo $MONGODB_URI_DEV

# Test connection
mongosh $MONGODB_URI_DEV
```

**2. Missing Database Credentials:**
```bash
# Check Atlas credentials
echo $MONGODB_URI_PROD

# Verify username and password
# Format: mongodb+srv://username:password@cluster.mongodb.net/database
```

---

## 🎛️ **Admin GUI Issues**

### **Common Admin GUI Problems**

**1. Admin GUI Not Starting:**
```bash
# Check if main API is running
curl http://localhost:5001/health

# Check admin GUI configuration
cd server/admin-gui
cat .env

# Start admin GUI
npm start
```

**2. Authentication Failed:**
```bash
# Check admin secret
echo $ADMIN_GUI_SECRET

# Test authentication
curl -X POST http://localhost:5002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"adminSecret":"hacklahoma-admin-2026"}'
```

**3. API Connection Issues:**
```bash
# Check main API URL
echo $MAIN_API_URL

# Test API connection
curl http://localhost:5001/admin/health

# Check CORS settings
curl -H "Origin: http://localhost:5002" http://localhost:5001/admin/health
```

### **Admin GUI Error Messages**

**Error: Connection Error**
```javascript
// Check browser console for errors
// Verify API endpoints are accessible
// Check network tab in developer tools
```

**Error: Failed to load data**
```bash
# Check if main API is running
ps aux | grep node

# Check API endpoints
curl http://localhost:5001/admin/database-stats
```

---

## 🚀 **Performance Issues**

### **Slow Database Queries**

**1. Check Indexes:**
```javascript
// Check if indexes exist
db.users.getIndexes()

// Create missing indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1, createdAt: -1 })
```

**2. Optimize Queries:**
```javascript
// Use select to limit fields
User.find({ role: 'hacker' }).select('firstName lastName email')

// Use limit for pagination
User.find({}).limit(10).skip(0)

// Use aggregation for complex queries
User.aggregate([
  { $match: { role: 'hacker' } },
  { $group: { _id: '$school', count: { $sum: 1 } } }
])
```

**3. Check Query Performance:**
```javascript
// Use explain to analyze queries
User.find({ role: 'hacker' }).explain('executionStats')
```

### **Memory Issues**

**1. Check Memory Usage:**
```bash
# Check Node.js memory usage
node --inspect dist/server.js

# Check system memory
free -h
top -p $(pgrep node)
```

**2. Optimize Memory Usage:**
```javascript
// Use streaming for large datasets
const stream = User.find({}).cursor();
stream.on('data', (doc) => {
  // Process document
});
```

**3. Restart Services:**
```bash
# Restart with PM2
pm2 restart hacklahoma-api

# Or restart manually
pkill -f node
npm run dev
```

---

## 🔍 **Debugging Techniques**

### **Backend Debugging**

**1. Enable Debug Logging:**
```bash
# Set debug level
LOG_LEVEL=debug npm run dev

# Or in .env
LOG_LEVEL=debug
```

**2. Use Debugger:**
```javascript
// Add breakpoints in code
debugger;

// Use console.log for debugging
console.log('Debug info:', data);
```

**3. Use Node Inspector:**
```bash
# Start with inspector
node --inspect dist/server.js

# Connect with Chrome DevTools
# Go to chrome://inspect
```

### **Frontend Debugging**

**1. React Developer Tools:**
```bash
# Install browser extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

**2. Console Debugging:**
```javascript
// Use console.log
console.log('Component props:', props);

// Use console.table for objects
console.table(data);

// Use console.group for organized output
console.group('User Data');
console.log('Name:', user.name);
console.log('Email:', user.email);
console.groupEnd();
```

**3. Network Debugging:**
```javascript
// Check network requests
// Open Developer Tools > Network tab
// Look for failed requests
// Check request/response headers
```

---

## 📊 **Monitoring and Logs**

### **Application Logs**

**1. PM2 Logs:**
```bash
# View all logs
pm2 logs

# View specific app logs
pm2 logs hacklahoma-api

# View error logs only
pm2 logs hacklahoma-api --err
```

**2. System Logs:**
```bash
# View system logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log
```

**3. Application Logs:**
```bash
# Check application logs
tail -f logs/app.log
tail -f logs/error.log
```

### **Database Logs**

**1. MongoDB Logs:**
```bash
# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Check MongoDB status
mongosh --eval "db.runCommand({serverStatus: 1})"
```

**2. Database Performance:**
```javascript
// Check slow queries
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

---

## 🛠️ **Common Fixes**

### **Quick Fixes**

**1. Restart Everything:**
```bash
# Stop all services
pkill -f node
brew services stop mongodb-community

# Start services
brew services start mongodb-community
cd server && npm run dev &
cd frontend && npm run dev &
cd server/admin-gui && npm start &
```

**2. Clear Caches:**
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# Ctrl+Shift+R (hard refresh)
```

**3. Reset Database:**
```bash
# Clear database
mongosh hacklahoma2026_dev --eval "db.dropDatabase()"

# Seed database
cd server
npm run seed
```

### **Environment Reset**

**1. Reset Environment:**
```bash
# Backup current .env
cp .env .env.backup

# Reset to defaults
cp env.example .env

# Edit with correct values
nano .env
```

**2. Reset Git:**
```bash
# Reset to last working commit
git reset --hard HEAD~1

# Or reset to specific commit
git reset --hard <commit-hash>
```

---

## 📞 **Getting Help**

### **Before Asking for Help**

1. **Check this guide** for your specific error
2. **Search existing issues** on GitHub
3. **Check logs** for error messages
4. **Try common fixes** listed above
5. **Gather information** about your environment

### **When Reporting Issues**

**Include the following information:**
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Error messages (full stack trace)
- Steps to reproduce
- What you've already tried

**Example Issue Report:**
```
**Environment:**
- OS: macOS 13.0
- Node.js: v18.17.0
- npm: 9.6.7

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5001
```

**Steps to Reproduce:**
1. Start server with `npm run dev`
2. Stop server with Ctrl+C
3. Try to start server again

**What I've tried:**
- Checked for processes using port 5001
- Tried different port
- Restarted terminal

**Logs:**
[Include relevant logs here]
```

### **Useful Commands for Debugging**

```bash
# Check running processes
ps aux | grep node

# Check port usage
lsof -i :5001

# Check environment variables
env | grep -E "(NODE_ENV|PORT|MONGODB_URI)"

# Check disk space
df -h

# Check memory usage
free -h

# Check network connectivity
ping google.com

# Check MongoDB status
brew services list | grep mongodb
```

---

## 🎯 **Prevention Tips**

### **Best Practices**

1. **Always use version control** - Commit working code
2. **Test changes incrementally** - Don't make too many changes at once
3. **Keep dependencies updated** - Regular security updates
4. **Use environment variables** - Don't hardcode sensitive data
5. **Monitor logs regularly** - Catch issues early
6. **Backup important data** - Regular database backups
7. **Document changes** - Keep track of what you've modified

### **Development Workflow**

1. **Start with clean environment** - Fresh install if needed
2. **Test locally first** - Before deploying
3. **Use staging environment** - Test before production
4. **Monitor performance** - Watch for memory leaks
5. **Keep logs clean** - Remove debug logs before production

---

**🏈 This troubleshooting guide should help you resolve most common issues with the Hacklahoma 2026 platform. If you're still having problems, don't hesitate to ask for help!**
