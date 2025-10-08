# README — Web App (TypeScript/Node + React + MongoDB + PWA)

> A batteries-included blueprint for your stack: scalable backend structure, role/permission security, migrations, multi-env DBs, internal admin/testing tools, CI on GitHub, frontend performance patterns, and push notifications without Firebase.

---

## 1) Tech Stack

* **Backend:** Node.js, TypeScript, Express, MongoDB (Mongoose)
* **Auth:** JWT access tokens + refresh tokens, server-side session tracking (revocation, IP/UA log)
* **RBAC/ABAC:** Roles (`participant`, `staff`) + fine-grained permissions
* **Frontend:** React + TypeScript, Tailwind CSS, Framer Motion
* **Testing:** Jest + ts-jest (unit), Supertest (API), React Testing Library (components), Cypress (E2E)
* **PWA:** Manifest + Service Worker; **Web Push API** via `web-push` (no Firebase required)
* **CI:** GitHub Actions (PRs and `regression/*` branches)
* **Dev UX:** Dev-only toolbar, component harness / Storybook-style sandbox, internal admin tool
* **Performance:** Code-splitting, skeletons, Suspense boundaries, request caching

---

## 2) Monorepo Layout (recommended)

```
repo/
  packages/
    backend/
      src/
        app.ts
        server.ts
        config/
          index.ts
          logger.ts
        db/
          connect.ts
          models/
            User.ts
            index.ts
          migrations/
            2025-10-07-add-user-flags.ts
          seeds/
            seed-dev.ts
        auth/
          tokens.ts
          sessionStore.ts
          password.ts
          middleware/
            requireAuth.ts
            requireRole.ts
            requirePermission.ts
            rateLimit.ts
            suspiciousActivity.ts
        modules/
          users/
            user.controller.ts
            user.service.ts
            user.router.ts
            user.types.ts
          ... (add new domains here)
        utils/
          http.ts
          errors.ts
        admin-tool/           # internal-only mini app (CLI or tiny Express UI)
          index.ts
      test/
        unit/
        integration/
      package.json
      jest.config.ts
      tsconfig.json
      .env.example
    frontend/
      src/
        main.tsx
        App.tsx
        routes/
        components/
        features/
          users/
        hooks/
        lib/
          api.ts           # fetch wrappers, react-query client, etc.
        devtools/          # dev-only toolbar + routes
          DevToolbar.tsx
          DevRoutes.tsx
        pwa/
          service-worker.ts
          sw-registration.ts
          manifest.webmanifest
        pages/
      public/
        icons/             # PWA icons
      cypress/
        e2e/
      jest.config.ts
      tsconfig.json
      package.json
    shared/
      types/
      utils/
  .github/
    workflows/
      ci.yml
  package.json
  pnpm-workspace.yaml (or yarn workspaces)
```

> **Scalability tip:** New data types live in `packages/backend/src/modules/<domain>` with a `*.router.ts`, `*.controller.ts`, `*.service.ts`, and optional `*.policy.ts`. Same pattern on the frontend under `features/<domain>`.

---

## 3) Backend Details

### 3.1 Express bootstrap

```ts
// packages/backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectMongo } from './db/connect';
import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './modules/users/user.router';
import { rateLimiter } from './auth/middleware/rateLimit';
import { suspiciousActivity } from './auth/middleware/suspiciousActivity';

export const createApp = async () => {
  await connectMongo();            // uses env-specific URI
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(morgan('combined'));

  // Global rate limiting + suspicious activity guard (tunable)
  app.use(rateLimiter);
  app.use(suspiciousActivity);

  app.use('/auth', authRouter);
  app.use('/users', userRouter);
  // app.use('/<new-domain>', newDomainRouter);

  // 404 + error handler...
  return app;
};
```

### 3.2 Roles + Permissions

```ts
// packages/backend/src/auth/middleware/requireRole.ts
import { RequestHandler } from 'express';
export const requireRole = (...roles: Array<'participant' | 'staff'>): RequestHandler =>
  (req, res, next) => {
    const user = req.user; // set by requireAuth
    if (!user || !roles.includes(user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };

// packages/backend/src/auth/middleware/requirePermission.ts
export const requirePermission = (perm: string): RequestHandler =>
  (req, res, next) => {
    const user = req.user;
    if (!user?.permissions?.includes(perm)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
```

> Combine RBAC and ABAC: secure endpoints with `requireRole('staff')` or granular checks `requirePermission('users.write')`.

### 3.3 JWT + Refresh + Session Tracking

* **Access Token:** short-lived (e.g. 10–15 min)
* **Refresh Token:** longer-lived (e.g. 7–30 days), httpOnly cookie
* **Session Store:** DB collection recording `userId`, `refreshTokenId`, `ip`, `userAgent`, `createdAt`, `revokedAt`
* **Manual revocation:** delete/mark a session, which invalidates associated refresh tokens.

```ts
// packages/backend/src/auth/tokens.ts
export interface TokenPayload { sub: string; role: 'participant'|'staff'; perms: string[]; sid: string; }
```

Attach `sid` (session id) to tokens for revocation checks.

### 3.4 Rate limiting & Suspicious activity

```ts
// packages/backend/src/auth/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
export const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 200, // tune per route; stricter for /auth
  standardHeaders: true,
  legacyHeaders: false,
});
```

```ts
// packages/backend/src/auth/middleware/suspiciousActivity.ts
import { RequestHandler } from 'express';
const ipHits = new Map<string, { count: number; windowStart: number }>();
export const suspiciousActivity: RequestHandler = (req, _res, next) => {
  const now = Date.now(), ip = req.ip ?? 'unknown';
  const rec = ipHits.get(ip) ?? { count: 0, windowStart: now };
  if (now - rec.windowStart > 60_000) { rec.count = 0; rec.windowStart = now; }
  rec.count++;
  ipHits.set(ip, rec);
  // Example thresholds
  if (req.path.startsWith('/auth/login') && rec.count > 20) {
    // log, flag, or temporarily block; consider Redis for distributed envs
  }
  next();
};
```

> For horizontal scale, move counters to **Redis** and add a background job to cool-off/block IPs or lock accounts.

---

## 4) Database Environments

Use **three URIs**:

```
MONGO_URI_DEV=mongodb://localhost:27017/app_dev
MONGO_URI_TEST=mongodb://localhost:27017/app_test
MONGO_URI_PROD=<atlas-or-managed-uri>
```

`connect.ts` picks based on `NODE_ENV` (`development`, `test`, `production`).

---

## 5) Migrations Strategy

* Keep **idempotent, versioned scripts** in `db/migrations/`.
* Each script exports `up()` and `down()`.
* Run via `pnpm migrate up` in CI/CD and locally after pulling.

```ts
// packages/backend/src/db/migrations/2025-10-07-add-user-flags.ts
import { Model } from 'mongoose';
export const up = async (User: Model<any>) => {
  await User.updateMany(
    { flags: { $exists: false } },
    { $set: { flags: { marketingOptIn: false, beta: false } } }
  );
};
export const down = async (User: Model<any>) => {
  await User.updateMany({}, { $unset: { 'flags': '' } });
};
```

A tiny runner loads Mongoose & models, then executes pending files by filename order. (You can also use `migrate-mongo` if preferred.)

---

## 6) Internal Admin / Testing Tool

Create a **separate, internal app** (`packages/backend/src/admin-tool/`) that:

* Authenticates via an **environment-guarded** shared secret only in `NODE_ENV=development` or behind VPN.
* Can: create users, grant/revoke permissions, impersonate users (issue tokens with a flag `impersonated: true`), seed data, trigger migrations.
* Expose **no routes** in prod builds.

---

## 7) Automated Testing

### 7.1 Backend (Jest + Supertest)

* Unit test services/controllers.
* Integration tests spin up an **ephemeral Mongo** (e.g., `mongodb-memory-server`) or connect to `MONGO_URI_TEST`.
* Fixtures for users/permissions.

### 7.2 Frontend (React Testing Library)

* Favor **queries by role/label/text**.
* Avoid implementation details.
* Use **`msw`** to mock API.

### 7.3 E2E (Cypress)

* Smoke flows: login, role-gated pages, critical forms.
* Use a **test user** seeding endpoint available only in `test` env.

---

## 8) GitHub Actions (CI)

Runs on PRs and on `regression/*` branches.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches:
      - main
      - regression/**
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { node: [18, 20] }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile

      # Backend unit/integration
      - name: Start MongoDB
        uses: supercharge/mongodb-github-action@1.10.0
        with: { mongodb-version: '6.0' }
      - run: pnpm --filter backend test

      # Frontend unit
      - run: pnpm --filter frontend test

      # Cypress E2E (optional headless)
      - name: Build frontend
        run: pnpm --filter frontend build
      - name: Start web (background)
        run: pnpm --filter frontend preview & pnpm --filter backend start:test &
      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          working-directory: packages/frontend
          wait-on: 'http://localhost:4173'
```

> Gate merges by requiring this workflow to pass, alongside your **CODEOWNERS** approvals.

---

## 9) Dev-Only Tools (Safe in Prod)

### 9.1 Dev Toolbar (frontend)

* Render only when `import.meta.env.DEV === true` **and** `process.env.REACT_APP_DEVTOOLS === 'on'` (double-guard).
* Optionally check for a **dev token** in localStorage to display.
* Exclude from prod build via tree-shaking / conditional import.

```tsx
// packages/frontend/src/devtools/DevToolbar.tsx
export const DevToolbar = () => {
  if (!import.meta.env.DEV || import.meta.env.VITE_DEVTOOLS !== 'on') return null;
  return (
    <aside className="fixed bottom-4 right-4 p-3 rounded shadow bg-white">
      <button onClick={() => fetch('/admin/dev/seed', { method: 'POST' })}>Seed users</button>
      <button onClick={() => fetch('/admin/dev/impersonate?role=staff')}>Impersonate staff</button>
    </aside>
  );
};
```

> **Backend** should **not** expose `/admin/dev/*` routes in prod builds (wrap route registration in `if (process.env.NODE_ENV !== 'production')`).

### 9.2 Component Harness / Storybook

* Quick option: add a **dev-only route** like `/__sandbox/<ComponentName>`.
* Or add **Storybook** for visual component isolation; mock data via `msw`.
* For DB-dependent components, point to **dev API** or mock with `msw`.

---

## 10) Frontend Performance Patterns

* **Data layer:** Prefer **TanStack Query (React Query)** or **SWR** for caching, background refresh, retries, and “instant” UI.
* **Skeletons & Splitting:** Route-based code splitting; skeleton UIs for heavy panels; **`React.Suspense`** where applicable.
* **Pagination & Virtualization:** Use **react-virtual** for large lists/tables.
* **Optimistic UI** for edits that don’t require strict read-after-write.

Example:

```tsx
// packages/frontend/src/features/users/useUser.ts
import { useQuery } from '@tanstack/react-query';
export const useUser = (id: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
    staleTime: 60_000,
  });
```

---

## 11) PWA & Push (No Firebase)

### 11.1 Manifest

```json
// packages/frontend/src/pwa/manifest.webmanifest
{
  "name": "Event Toolkit",
  "short_name": "EventKit",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#111827",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 11.2 Service Worker (push + click routing)

```js
// packages/frontend/src/pwa/service-worker.ts
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body,
      data: { url: data.url, modalPayload: data.modalPayload },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientsArr) => {
    const hadWindow = clientsArr.some((w) => (w.url.includes(self.location.origin) && w.focus()));
    if (!hadWindow) clients.openWindow(url);
  }));
});
```

### 11.3 Browser subscription (client)

```ts
// register & subscribe
const registerSWAndSubscribe = async () => {
  const reg = await navigator.serviceWorker.register('/service-worker.js');
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: '<VAPID_PUBLIC_BASE64>',
  });
  await fetch('/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
};
```

### 11.4 Server push (Node `web-push`)

```ts
// packages/backend/src/modules/push/push.service.ts
import webpush from 'web-push';
webpush.setVapidDetails('mailto:admin@example.com', process.env.VAPID_PUBLIC!, process.env.VAPID_PRIVATE!);

export const sendPush = async (subscription: any, payload: any) =>
  webpush.sendNotification(subscription, JSON.stringify(payload));
```

> Payload includes a `url` so tapping the notification navigates to your desired route and your app shows a modal/sidebar accordingly.

---

## 12) Conventions & Best Practices

* **API style:** RESTful; version under `/api/v1`.
* **Controllers:** thin; `service` holds business logic.
* **Validation:** Zod or Joi at the route boundary.
* **Logging:** structured (pino/winston), include `requestId`, user id, ip.
* **Errors:** central handler; never leak internals.
* **Tailwind:** use design tokens (colors/spacing), componentize patterns.
* **Framer Motion:** wrap only animating regions; prefer reduced-motion for accessibility.
* **Security headers:** `helmet`, strict CORS, `SameSite` cookies for refresh token.
* **Content Security Policy (CSP)** tuned for your domains.

---

## 13) Environment Variables

```
# Common
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Mongo
MONGO_URI_DEV=...
MONGO_URI_TEST=...
MONGO_URI_PROD=...

# JWT
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# Sessions
SESSION_ISSUER=eventkit
SESSION_PRUNE_MINS=60

# Push (VAPID)
VAPID_PUBLIC=...
VAPID_PRIVATE=...

# Frontend (Vite)
VITE_API_BASE=http://localhost:4000
VITE_DEVTOOLS=on
```

---

## 14) NPM Scripts (monorepo examples)

**Root `package.json`:**

```json
{
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r dev",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "migrate:up": "pnpm --filter backend migrate:up",
    "seed": "pnpm --filter backend seed:dev"
  }
}
```

**Backend `package.json`:**

```json
{
  "scripts": {
    "dev": "ts-node-dev src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "start:test": "NODE_ENV=test node dist/server.js",
    "test": "jest --runInBand",
    "migrate:up": "ts-node src/db/run-migrations.ts up",
    "migrate:down": "ts-node src/db/run-migrations.ts down",
    "seed:dev": "ts-node src/db/seeds/seed-dev.ts",
    "lint": "eslint 'src/**/*.{ts,tsx}'"
  }
}
```

**Frontend `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "cypress": "cypress run",
    "lint": "eslint 'src/**/*.{ts,tsx}'"
  }
}
```

---

## 15) Sample Protected Route (role + permission)

```ts
// packages/backend/src/modules/users/user.router.ts
import { Router } from 'express';
import { requireAuth } from '../../auth/middleware/requireAuth';
import { requireRole } from '../../auth/middleware/requireRole';
import { requirePermission } from '../../auth/middleware/requirePermission';
import * as ctrl from './user.controller';

export const userRouter = Router();
userRouter.use(requireAuth); // all below require auth

userRouter.get('/:id',
  requireRole('participant', 'staff'),
  ctrl.getUser);

userRouter.post('/',
  requireRole('staff'),
  requirePermission('users.write'),
  ctrl.createUser);
```

---

## 16) Page-Load UX (example pattern)

```tsx
// packages/frontend/src/pages/UserPage.tsx
import { useUser } from '../features/users/useUser';
import { Suspense } from 'react';
import Skeleton from '../components/Skeleton';

export const UserPage = ({ id }: { id: string }) => {
  return (
    <div className="space-y-6">
      <Header/> {/* lightweight, instant */}
      <Suspense fallback={<Skeleton.UserCard/>}>
        <UserCard id={id}/>
      </Suspense>
      <Suspense fallback={<Skeleton.ActivityList/>}>
        <UserActivity id={id}/>
      </Suspense>
    </div>
  );
};
```

> Small, static chrome renders first; heavier panels show **skeletons** until data resolves. Pair with **React Query** for caching & background refresh.

---

## 17) Security Checklist

* [ ] Short-lived access tokens + refresh tokens in httpOnly cookies
* [ ] Server-side session store (IP + UA + createdAt + revoked)
* [ ] Global + route-level rate limits (stricter on `/auth/*`)
* [ ] Suspicious activity detection (burst IPs, brute attempts)
* [ ] Password hashing (Argon2/bcrypt), strong password policy
* [ ] Input validation (Zod/Joi) on every write endpoint
* [ ] Audit logs for sensitive actions (who/when/what)
* [ ] Prod config disables any dev routes/toolbars entirely
* [ ] CSP, Helmet, secure cookies, no secrets in client bundle
* [ ] Regular dependency scanning & updates

---

## 18) How to Add a New Data Type (repeatable)

1. **Backend:** `packages/backend/src/modules/things/` with `thing.model.ts`, `thing.service.ts`, `thing.controller.ts`, `thing.router.ts`.
2. **Register Route:** `app.ts` → `app.use('/things', thingRouter)`.
3. **Permissions:** add `things.read`, `things.write` where needed.
4. **Frontend:** `packages/frontend/src/features/things/` components + hooks (`useThings` with React Query).
5. **Migrations:** add script if existing docs need a backfill.
6. **Tests:** unit (service), integration (controller), E2E (create/list).

---

## 19) Getting Started

```bash
# 1) Install
pnpm install

# 2) Env
cp packages/backend/.env.example packages/backend/.env
# fill in MONGO_URIs, JWT secrets, VAPID keys (generate via web-push CLI)

# 3) Dev
pnpm --filter backend dev
pnpm --filter frontend dev

# 4) Tests
pnpm test

# 5) E2E (optional)
pnpm --filter frontend cypress
```

---

If you want, I can tailor this README into your repo with the exact scripts you use (pnpm/yarn/npm), wire up a basic migration runner, or drop in the dev toolbar and a push-ready service worker scaffold.
