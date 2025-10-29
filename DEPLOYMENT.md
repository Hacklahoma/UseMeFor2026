# 🚀 Hacklahoma 2026 - Deployment Guide

> Comprehensive deployment and production setup guide for the Hacklahoma 2026 platform

---

## 🎯 **Deployment Overview**

This guide covers deployment strategies for both development and production environments, including security considerations, environment configuration, and monitoring setup.

---

## 🏗️ **Deployment Architecture**

### **Development Environment**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Admin GUI     │
                       │   (Express)     │
                       │   Port: 5002    │
                       └─────────────────┘
```

### **Production Environment**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Web       │    │   Load Balancer │    │   MongoDB       │
│   Server        │◄──►│   (PM2/Cluster) │◄──►│   Atlas         │
│   (Static)      │    │   Port: 5001    │    │   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Admin GUI     │
                       │   (DISABLED)    │
                       │   (Security)    │
                       └─────────────────┘
```

---

## 🛠️ **Prerequisites**

### **System Requirements**
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **MongoDB**: 6.0 or higher (local) or MongoDB Atlas (cloud)
- **Git**: Latest version
- **PM2**: For production process management (optional)

### **Development Tools**
- **VS Code** (recommended)
- **MongoDB Compass** (database management)
- **Postman** (API testing)
- **Git** (version control)

---

## 🔧 **Development Deployment**

### **1. Clone Repository**
```bash
git clone https://github.com/your-org/HacklahomaSite2026.git
cd HacklahomaSite2026
```

### **2. Install Dependencies**

**Backend Dependencies:**
```bash
cd server
npm install
```

**Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

**Admin GUI Dependencies:**
```bash
cd ../server/admin-gui
npm install
```

### **3. Environment Configuration**

**Backend Environment (.env):**
```bash
cd server
cp env.example .env
```

Edit `.env` file:
```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database Configuration
MONGODB_URI_DEV=mongodb://localhost:27017/hacklahoma2026_dev
MONGODB_URI_TEST=mongodb://localhost:27017/hacklahoma2026_test
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Session Configuration
SESSION_ISSUER=hacklahoma2026
SESSION_PRUNE_MINS=60

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development Tools
ENABLE_DEV_ROUTES=on
ENABLE_ADMIN_TOOL=on

# Logging
LOG_LEVEL=info
```

**Admin GUI Environment (.env):**
```bash
cd server/admin-gui
cp env.example .env
```

Edit `.env` file:
```env
# Admin GUI Configuration
ADMIN_GUI_ENABLED=true
ADMIN_GUI_SECRET=hacklahoma-admin-2026
ADMIN_GUI_PORT=5002
SESSION_SECRET=your-session-secret-here
MAIN_API_URL=http://localhost:5001
MAIN_API_ADMIN_PATH=/admin
ALLOWED_IPS=127.0.0.1,::1
SESSION_TTL=3600
ENABLE_SECURITY_HEADERS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **4. Database Setup**

**Local MongoDB:**
```bash
# Start MongoDB service
brew services start mongodb-community
# or
sudo systemctl start mongod

# Create development database
mongosh
use hacklahoma2026_dev
```

**MongoDB Atlas (Cloud):**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGODB_URI_PROD` in `.env`

### **5. Start Development Servers**

**Option 1: Manual Start (Recommended for Development)**
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Admin GUI
cd server/admin-gui
npm start
```

**Option 2: Automated Start**
```bash
# Start all servers with one command
cd server
./start-all.sh
```

### **6. Verify Installation**

**Check Backend:**
```bash
curl http://localhost:5001/health
```

**Check Frontend:**
Open browser to `http://localhost:3000`

**Check Admin GUI:**
Open browser to `http://localhost:5002`

---

## 🌐 **Production Deployment**

### **1. Environment Preparation**

**Production Environment Variables:**
```env
# Server Configuration
NODE_ENV=production
PORT=5001

# Database Configuration
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026

# JWT Configuration (USE STRONG SECRETS!)
JWT_ACCESS_SECRET=your-production-access-secret-256-bits-minimum
JWT_REFRESH_SECRET=your-production-refresh-secret-256-bits-minimum
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com

# Session Configuration
SESSION_ISSUER=hacklahoma2026
SESSION_PRUNE_MINS=60

# Rate Limiting (Stricter for production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Development Tools (DISABLED in production)
ENABLE_DEV_ROUTES=off
ENABLE_ADMIN_TOOL=off

# Logging
LOG_LEVEL=warn
```

### **2. Build Applications**

**Build Backend:**
```bash
cd server
npm run build
```

**Build Frontend:**
```bash
cd frontend
npm run build
```

### **3. Production Server Setup**

**Using PM2 (Recommended):**
```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hacklahoma-api',
    script: './dist/server.js',
    cwd: './server',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

**Using Docker (Alternative):**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY server/dist ./dist

# Expose port
EXPOSE 5001

# Start application
CMD ["node", "dist/server.js"]
```

### **4. Web Server Configuration**

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/hacklahoma/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

**Apache Configuration:**
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/hacklahoma/frontend/build

    # Frontend
    <Directory /var/www/hacklahoma/frontend/build>
        AllowOverride All
        Require all granted
    </Directory>

    # Backend API
    ProxyPreserveHost On
    ProxyPass /api http://localhost:5001/api
    ProxyPassReverse /api http://localhost:5001/api

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
</VirtualHost>
```

### **5. SSL Certificate Setup**

**Using Let's Encrypt:**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **6. Database Production Setup**

**MongoDB Atlas Configuration:**
1. **Cluster Setup:**
   - Choose appropriate tier (M0 for development, M10+ for production)
   - Select region closest to your users
   - Enable backup and monitoring

2. **Security Configuration:**
   - Create database user with minimal required permissions
   - Configure IP whitelist
   - Enable network encryption
   - Set up database auditing

3. **Connection String:**
```env
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026?retryWrites=true&w=majority
```

---

## 🔒 **Security Configuration**

### **1. Environment Security**

**Secure Environment Variables:**
```bash
# Generate strong secrets
openssl rand -base64 32  # For JWT secrets
openssl rand -base64 32  # For session secrets

# Set file permissions
chmod 600 .env
chown root:root .env
```

**Firewall Configuration:**
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5001/tcp   # Block direct API access
sudo ufw enable
```

### **2. Application Security**

**Security Headers:**
```javascript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Rate Limiting:**
```javascript
// Stricter rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### **3. Database Security**

**MongoDB Atlas Security:**
- Enable authentication
- Use strong passwords
- Enable network encryption
- Configure IP whitelist
- Enable database auditing
- Regular security updates

---

## 📊 **Monitoring and Logging**

### **1. Application Monitoring**

**PM2 Monitoring:**
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs hacklahoma-api

# Restart application
pm2 restart hacklahoma-api
```

**Health Check Endpoint:**
```bash
# Check application health
curl https://yourdomain.com/api/health
```

### **2. Log Management**

**Log Rotation:**
```bash
# Install logrotate
sudo apt-get install logrotate

# Configure log rotation
sudo nano /etc/logrotate.d/hacklahoma
```

```bash
/var/log/hacklahoma/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

### **3. Error Tracking**

**Sentry Integration:**
```javascript
// Install Sentry
npm install @sentry/node @sentry/integrations

// Configure Sentry
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: 1.0,
});
```

---

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd server && npm ci
        cd ../frontend && npm ci
    
    - name: Run tests
      run: |
        cd server && npm test
        cd ../frontend && npm test
    
    - name: Build applications
      run: |
        cd server && npm run build
        cd ../frontend && npm run build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/hacklahoma
          git pull origin main
          cd server && npm ci --production
          cd ../frontend && npm ci --production
          pm2 restart hacklahoma-api
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Port Already in Use:**
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>
```

**2. Database Connection Issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
mongosh "mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026"
```

**3. Permission Issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /var/www/hacklahoma
chmod -R 755 /var/www/hacklahoma
```

**4. Memory Issues:**
```bash
# Check memory usage
free -h
pm2 monit

# Restart if needed
pm2 restart hacklahoma-api
```

### **Log Analysis**

**Application Logs:**
```bash
# View PM2 logs
pm2 logs hacklahoma-api

# View system logs
sudo journalctl -u nginx
sudo tail -f /var/log/nginx/error.log
```

**Database Logs:**
```bash
# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] Backup strategy in place

### **Post-Deployment**
- [ ] Health checks passing
- [ ] All endpoints responding
- [ ] Database connectivity verified
- [ ] Monitoring configured
- [ ] Logs being collected
- [ ] Performance metrics normal

### **Security Checklist**
- [ ] Admin GUI disabled in production
- [ ] Strong secrets generated
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] HTTPS enforced
- [ ] Security headers applied

---

## 🔄 **Backup and Recovery**

### **Database Backup**

**MongoDB Atlas Backup:**
- Automatic backups enabled
- Point-in-time recovery available
- Cross-region backup replication

**Manual Backup:**
```bash
# Create backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026" --out=backup/

# Restore backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/hacklahoma2026" backup/hacklahoma2026/
```

### **Application Backup**

**Code Backup:**
```bash
# Git repository (already backed up)
git push origin main

# Configuration backup
tar -czf config-backup.tar.gz .env ecosystem.config.js
```

**File System Backup:**
```bash
# Backup application files
tar -czf hacklahoma-backup-$(date +%Y%m%d).tar.gz /var/www/hacklahoma
```

---

## 📈 **Performance Optimization**

### **Application Performance**

**Node.js Optimization:**
```javascript
// Cluster mode for better performance
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start application
}
```

**Database Optimization:**
- Proper indexing
- Query optimization
- Connection pooling
- Caching strategies

### **Frontend Performance**

**Build Optimization:**
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

**CDN Configuration:**
- Static asset delivery
- Global content distribution
- Caching strategies

---

**🏈 This deployment guide ensures a secure, scalable, and maintainable production environment for the Hacklahoma 2026 platform.**
