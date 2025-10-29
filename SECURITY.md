# 🔒 Hacklahoma 2026 - Security Documentation

> Comprehensive security documentation and best practices for the Hacklahoma 2026 platform

---

## 🎯 **Security Overview**

The Hacklahoma 2026 platform implements multiple layers of security to protect user data, prevent unauthorized access, and ensure system integrity. This document outlines the security measures, best practices, and incident response procedures.

---

## 🛡️ **Security Architecture**

### **Defense in Depth Strategy**
```
┌─────────────────────────────────────────────────────────┐
│                    USER LAYER                           │
├─────────────────────────────────────────────────────────┤
│  Input Validation  │  Rate Limiting  │  Authentication │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                    │
├─────────────────────────────────────────────────────────┤
│  JWT Tokens  │  Session Management  │  Authorization   │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                           │
├─────────────────────────────────────────────────────────┤
│  Password Hashing  │  Data Encryption  │  Access Control│
├─────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                 │
├─────────────────────────────────────────────────────────┤
│  HTTPS/TLS  │  Firewall  │  Network Security  │  Monitoring│
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 **Authentication Security**

### **JWT Token Security**

**Token Structure:**
```typescript
interface TokenPayload {
  sub: string;           // User ID
  role: UserRole;        // User role
  perms: string[];       // User permissions
  sid: string;           // Session ID for revocation
  impersonated?: boolean; // Impersonation flag
  iat: number;           // Issued at
  exp: number;           // Expires at
}
```

**Security Measures:**
- **Short-lived Access Tokens**: 15 minutes expiration
- **Long-lived Refresh Tokens**: 7 days expiration, httpOnly cookies
- **Session Tracking**: Server-side session management
- **Token Revocation**: Immediate invalidation capability
- **Strong Secrets**: 256-bit minimum secret keys

**Implementation:**
```typescript
// Token generation with security measures
const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_TTL,
    issuer: config.SESSION_ISSUER,
    algorithm: 'HS256'
  });
};
```

### **Password Security**

**Password Requirements:**
- Minimum 8 characters
- Maximum 128 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character
- Not in common password list

**Password Hashing:**
```typescript
// bcrypt with 12 rounds (higher than default)
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Password Validation:**
```typescript
const validatePasswordStrength = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  // Length validation
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Character requirements
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Common password check
  const commonPasswords = ['password', '123456', 'qwerty'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

---

## 🚫 **Authorization Security**

### **Role-Based Access Control (RBAC)**

**User Roles:**
```typescript
enum UserRole {
  HACKER = 'hacker',    // Event participants
  STAFF = 'staff'       // Event organizers and staff
}
```

**Permission System:**
```typescript
interface UserPermissions {
  users: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  admin: {
    access: boolean;
    impersonate: boolean;
  };
}
```

**Authorization Middleware:**
```typescript
// Role-based authorization
export const requireRole = (...roles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Permission-based authorization
export const requirePermission = (permission: string): RequestHandler => {
  return (req, res, next) => {
    const user = req.user;
    if (!user?.permissions?.includes(permission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
};
```

---

## 🛡️ **Input Validation and Sanitization**

### **Request Validation**

**Zod Schema Validation:**
```typescript
import { z } from 'zod';

const userSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Invalid characters'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email too long'),
  password: z.string()
    .min(8, 'Password too short')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'Password requirements not met')
});

// Validate request body
const validateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    userSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Validation failed', details: error.errors });
  }
};
```

**SQL Injection Prevention:**
```typescript
// Use parameterized queries (Mongoose handles this)
const user = await User.findOne({ email: email }); // Safe

// Never use string concatenation
// const query = `SELECT * FROM users WHERE email = '${email}'`; // DANGEROUS
```

**XSS Prevention:**
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Use in forms
const cleanInput = sanitizeInput(userInput);
```

---

## 🚦 **Rate Limiting and DDoS Protection**

### **Global Rate Limiting**

**Express Rate Limiting:**
```typescript
import rateLimit from 'express-rate-limit';

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});
```

**Suspicious Activity Detection:**
```typescript
// Track suspicious activity
const suspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  // Track activity per IP
  if (!ipActivityMap.has(ip)) {
    ipActivityMap.set(ip, { count: 0, windowStart: now });
  }
  
  const activity = ipActivityMap.get(ip)!;
  
  // Reset window if expired
  if (now - activity.windowStart > 60000) { // 1 minute
    activity.count = 0;
    activity.windowStart = now;
  }
  
  activity.count++;
  
  // Alert on suspicious activity
  if (req.path.startsWith('/auth') && activity.count > 10) {
    logger.warn('Suspicious auth activity detected', {
      ip,
      path: req.path,
      count: activity.count,
      userAgent: req.get('User-Agent')
    });
  }
  
  next();
};
```

---

## 🔒 **Data Protection**

### **Data Encryption**

**At Rest Encryption:**
- **MongoDB Atlas**: Automatic encryption at rest
- **Local MongoDB**: Filesystem encryption recommended
- **Sensitive Data**: Field-level encryption for PII

**In Transit Encryption:**
```typescript
// HTTPS enforcement
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

**Data Sanitization:**
```typescript
// Remove sensitive data from responses
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    const { password, ...userWithoutPassword } = ret;
    return userWithoutPassword;
  }
});

// Sanitize logs
const sanitizeForLogging = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'secret'];
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};
```

---

## 🌐 **Network Security**

### **CORS Configuration**

**Secure CORS Setup:**
```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',    // Development frontend
      'https://hacklahoma.org',   // Production frontend
      'https://admin.hacklahoma.org' // Admin interface
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### **Security Headers**

**Helmet Configuration:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

---

## 🔍 **Session Management**

### **Secure Session Configuration**

**Session Security:**
```typescript
import session from 'express-session';

app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  name: 'hacklahoma.sid', // Don't use default session name
  rolling: true // Reset expiration on activity
}));
```

**Session Revocation:**
```typescript
// Revoke specific session
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

// Revoke all user sessions
const revokeAllUserSessions = async (userId: string): Promise<number> => {
  const result = await Session.updateMany(
    { userId, isRevoked: false },
    { 
      isRevoked: true, 
      revokedAt: new Date() 
    }
  );
  
  return result.modifiedCount;
};
```

---

## 🚨 **Security Monitoring**

### **Audit Logging**

**Security Event Logging:**
```typescript
interface SecurityEvent {
  type: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

const logSecurityEvent = (event: SecurityEvent) => {
  logger.warn('Security Event', {
    type: event.type,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    timestamp: event.timestamp,
    details: event.details
  });
  
  // Send to security monitoring system
  if (process.env.NODE_ENV === 'production') {
    // Send to external security monitoring
  }
};
```

**Failed Login Tracking:**
```typescript
const trackFailedLogin = (email: string, ip: string, userAgent: string) => {
  logSecurityEvent({
    type: 'FAILED_LOGIN',
    ip,
    userAgent,
    timestamp: new Date(),
    details: { email, attempts: getFailedAttempts(ip) }
  });
  
  // Implement account lockout after multiple failures
  if (getFailedAttempts(ip) >= 5) {
    // Lock account or IP temporarily
    lockAccount(email, ip);
  }
};
```

### **Intrusion Detection**

**Anomaly Detection:**
```typescript
const detectAnomalies = (req: Request) => {
  const ip = req.ip || 'unknown';
  const userAgent = req.get('User-Agent') || '';
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scanner/i,
    /sqlmap/i,
    /nikto/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      ip,
      userAgent,
      timestamp: new Date(),
      details: { reason: 'Suspicious User-Agent' }
    });
  }
};
```

---

## 🔧 **Admin Tool Security**

### **Development-Only Access**

**Environment Guards:**
```typescript
// Admin tool only available in development
export const createAdminRouter = (): Router => {
  const router = Router();
  
  // Security check - disable in production
  if (config.NODE_ENV === 'production' && config.ENABLE_ADMIN_TOOL) {
    logger.error('SECURITY WARNING: Admin tool should not be enabled in production!');
    process.exit(1);
  }
  
  if (!config.ENABLE_ADMIN_TOOL) {
    logger.warn('Admin tool is disabled');
    return router;
  }
  
  // Admin routes...
  return router;
};
```

**Admin Authentication:**
```typescript
// Multi-layer admin authentication
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check session authentication
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check admin secret
  const providedSecret = req.headers['x-admin-secret'] || req.body.adminSecret;
  if (providedSecret !== config.ADMIN_GUI_SECRET) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }
  
  // Check IP whitelist (if configured)
  if (config.ALLOWED_IPS.length > 0) {
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!config.ALLOWED_IPS.includes(clientIP)) {
      return res.status(403).json({ error: 'Access denied from this IP' });
    }
  }
  
  next();
};
```

---

## 🚨 **Incident Response**

### **Security Incident Classification**

**Severity Levels:**
- **Critical**: Data breach, system compromise
- **High**: Unauthorized access, privilege escalation
- **Medium**: Failed attacks, suspicious activity
- **Low**: Policy violations, minor issues

**Response Procedures:**
```typescript
const handleSecurityIncident = (incident: SecurityIncident) => {
  // Log incident
  logger.error('Security Incident', incident);
  
  // Immediate response based on severity
  switch (incident.severity) {
    case 'CRITICAL':
      // Immediate system lockdown
      lockdownSystem();
      notifySecurityTeam(incident);
      break;
    case 'HIGH':
      // Revoke affected sessions
      revokeAffectedSessions(incident);
      notifySecurityTeam(incident);
      break;
    case 'MEDIUM':
      // Increase monitoring
      increaseMonitoring(incident);
      logIncident(incident);
      break;
    case 'LOW':
      // Log and monitor
      logIncident(incident);
      break;
  }
};
```

### **Incident Response Checklist**

**Immediate Response (0-15 minutes):**
- [ ] Identify and contain the threat
- [ ] Preserve evidence
- [ ] Notify security team
- [ ] Assess scope and impact

**Short-term Response (15 minutes - 4 hours):**
- [ ] Implement temporary fixes
- [ ] Monitor for additional attacks
- [ ] Document incident details
- [ ] Notify stakeholders if needed

**Long-term Response (4+ hours):**
- [ ] Conduct forensic analysis
- [ ] Implement permanent fixes
- [ ] Update security measures
- [ ] Review and improve procedures

---

## 🔄 **Security Updates and Maintenance**

### **Dependency Security**

**Regular Security Audits:**
```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update
```

**Automated Security Scanning:**
```yaml
# GitHub Actions security workflow
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: npm audit --audit-level high
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### **Security Monitoring**

**Health Checks:**
```typescript
// Security health check endpoint
app.get('/security/health', (req, res) => {
  const securityStatus = {
    authentication: checkAuthStatus(),
    rateLimiting: checkRateLimitStatus(),
    encryption: checkEncryptionStatus(),
    monitoring: checkMonitoringStatus(),
    lastSecurityUpdate: getLastSecurityUpdate()
  };
  
  res.json(securityStatus);
});
```

---

## 📋 **Security Checklist**

### **Pre-Deployment Security Checklist**

**Authentication & Authorization:**
- [ ] Strong password requirements implemented
- [ ] JWT tokens properly configured
- [ ] Session management secure
- [ ] Role-based access control working
- [ ] Admin authentication secure

**Data Protection:**
- [ ] Sensitive data encrypted at rest
- [ ] Data encrypted in transit (HTTPS)
- [ ] Input validation implemented
- [ ] Output sanitization working
- [ ] Password hashing secure

**Network Security:**
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Rate limiting active
- [ ] Firewall configured
- [ ] DDoS protection enabled

**Monitoring & Logging:**
- [ ] Security events logged
- [ ] Monitoring systems active
- [ ] Incident response procedures defined
- [ ] Backup and recovery tested

### **Ongoing Security Maintenance**

**Weekly:**
- [ ] Review security logs
- [ ] Check for failed login attempts
- [ ] Monitor system performance
- [ ] Update security documentation

**Monthly:**
- [ ] Security dependency audit
- [ ] Penetration testing
- [ ] Security training review
- [ ] Incident response drill

**Quarterly:**
- [ ] Full security assessment
- [ ] Security policy review
- [ ] Access control audit
- [ ] Disaster recovery test

---

## 🎓 **Security Training**

### **Developer Security Guidelines**

**Secure Coding Practices:**
- Always validate and sanitize input
- Use parameterized queries
- Implement proper error handling
- Follow principle of least privilege
- Keep dependencies updated

**Common Vulnerabilities to Avoid:**
- SQL injection
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Insecure direct object references
- Security misconfiguration

### **Security Resources**

**Documentation:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

**Tools:**
- [ESLint Security Plugin](https://github.com/eslint-community/eslint-plugin-security)
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing

---

**🏈 This security documentation ensures the Hacklahoma 2026 platform maintains the highest security standards to protect user data and system integrity.**
