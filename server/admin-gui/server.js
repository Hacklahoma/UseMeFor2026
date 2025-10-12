const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration
const config = {
  PORT: process.env.ADMIN_GUI_PORT || 5002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ENABLED: process.env.ADMIN_GUI_ENABLED === 'true',
  SECRET: process.env.ADMIN_GUI_SECRET || 'dev-secret-change-this',
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret',
  MAIN_API_URL: process.env.MAIN_API_URL || 'http://localhost:5001',
  MAIN_API_ADMIN_PATH: process.env.MAIN_API_ADMIN_PATH || '/admin',
  ALLOWED_IPS: process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [],
  SESSION_TTL: parseInt(process.env.SESSION_TTL) || 3600,
  ENABLE_SECURITY_HEADERS: process.env.ENABLE_SECURITY_HEADERS === 'true',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

// Security check - disable in production
if (config.NODE_ENV === 'production' && config.ENABLED) {
  console.error('🚨 SECURITY WARNING: Admin GUI should not be enabled in production!');
  process.exit(1);
}

if (!config.ENABLED) {
  console.log('ℹ️  Admin GUI is disabled');
  process.exit(0);
}

// Security middleware
if (config.ENABLE_SECURITY_HEADERS) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", config.MAIN_API_URL]
      }
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// IP whitelist middleware (only in production or when specified)
if (config.ALLOWED_IPS.length > 0) {
  app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    if (!config.ALLOWED_IPS.includes(clientIP)) {
      console.log(`🚫 Blocked access from IP: ${clientIP}`);
      return res.status(403).json({ error: 'Access denied from this IP address' });
    }
    next();
  });
}

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

// Session management
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: config.SESSION_TTL * 1000
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    return next();
  }
  
  // Check for admin secret in header or body
  const providedSecret = req.headers['x-admin-secret'] || req.body.adminSecret;
  if (providedSecret === config.SECRET) {
    req.session.authenticated = true;
    return next();
  }
  
  // If accessing login page, allow through
  if (req.path === '/login' || req.path === '/') {
    return next();
  }
  
  return res.status(401).json({ error: 'Authentication required' });
};

// API helper function
const callMainAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const url = `${config.MAIN_API_URL}${config.MAIN_API_ADMIN_PATH}${endpoint}`;
    const options = {
      method,
      url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.data = data;
    }
    
    const response = await axios(options);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message,
      status: error.response?.status || 500
    };
  }
};

// Routes

// Login/Authentication
app.post('/auth/login', (req, res) => {
  const { adminSecret } = req.body;
  
  if (adminSecret === config.SECRET) {
    req.session.authenticated = true;
    res.json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid admin secret' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Dashboard API endpoints
app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  const result = await callMainAPI('/database-stats');
  if (result.success) {
    // Return the data directly - frontend apiCall() will wrap it
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.get('/api/dashboard/health', requireAuth, async (req, res) => {
  const result = await callMainAPI('/health');
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.get('/api/system-info', requireAuth, async (req, res) => {
  const result = await callMainAPI('/system-info');
  if (result.success) {
    // Unwrap the systemInfo from the response
    res.json(result.data.systemInfo || result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

// User management endpoints
app.get('/api/users', requireAuth, async (req, res) => {
  const result = await callMainAPI('/users');
  if (result.success) {
    // Return the data directly - frontend apiCall() will wrap it
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.post('/api/users', requireAuth, async (req, res) => {
  const result = await callMainAPI('/users', 'POST', req.body);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.put('/api/users/:userId', requireAuth, async (req, res) => {
  const result = await callMainAPI(`/users/${req.params.userId}`, 'PUT', req.body);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

// Database management endpoints
app.post('/api/database/seed-users', requireAuth, async (req, res) => {
  const result = await callMainAPI('/seed-users', 'POST');
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.post('/api/database/seed-all', requireAuth, async (req, res) => {
  const result = await callMainAPI('/seed-all', 'POST');
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.post('/api/database/clear', requireAuth, async (req, res) => {
  const result = await callMainAPI('/clear-database', 'POST');
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

// Impersonation endpoints
app.post('/api/impersonate/user/:userId', requireAuth, async (req, res) => {
  const result = await callMainAPI(`/impersonate/${req.params.userId}`, 'POST');
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

app.post('/api/impersonate/role/:role', requireAuth, async (req, res) => {
  const result = await callMainAPI(`/impersonate/role/${req.params.role}`, 'POST');
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.error });
  }
});

// Serve main dashboard page
app.get('/', (req, res) => {
  if (!req.session.authenticated) {
    return res.sendFile(path.join(__dirname, 'views', 'login.html'));
  }
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Health check for the admin GUI itself
app.get('/health', (req, res) => {
  res.json({
    status: 'Admin GUI is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    mainApiUrl: config.MAIN_API_URL
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Admin GUI Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const server = app.listen(config.PORT, () => {
  console.log(`⚡ Hacklahoma Admin GUI running on port ${config.PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 Main API: ${config.MAIN_API_URL}`);
  console.log(`🔒 Security headers: ${config.ENABLE_SECURITY_HEADERS ? 'enabled' : 'disabled'}`);
  console.log(`📊 Dashboard: http://localhost:${config.PORT}`);
  console.log('');
  console.log('🏈 University of Oklahoma - Ready for tech team database management!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down admin GUI gracefully...');
  server.close(() => {
    console.log('✅ Admin GUI server closed');
    process.exit(0);
  });
});

module.exports = app;
