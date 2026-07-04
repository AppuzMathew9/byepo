# Multi-Tenant Feature Flag Management System

A multi-tenant feature flag management application built as a technical assignment for Byepo Technologies. It enables organizations to toggle features, manage platform tenants (Super Admin), and provision end-user client keys.

---

## 1. Tech Stack

*   **Backend:** Node.js, Express, TypeScript
*   **Database:** MySQL 8, Drizzle ORM
*   **Authentication & Security:** JWT (HS256 tokens via \`jose\`), bcryptjs (12 rounds)
*   **Frontend:** React, Vite, Tailwind CSS, \`wouter\` (routing)

---

## 2. Directory Structure


byepo-feature-flags/
├── server/
│   ├── app.ts                 # Express configuration, global middleware, & route mounting
│   ├── server.ts              # HTTP server start, database connection, & dev/prod asset serving
│   ├── config/
│   │   ├── db.ts              # MySQL connection pool singleton via Drizzle
│   │   └── env.ts             # Environment validation using Zod
│   ├── controllers/           # Express route handlers
│   ├── services/              # Business logic layer
│   ├── repositories/          # Drizzle queries & database operations
│   ├── routes/                # Express Route files
│   ├── middleware/            # Auth, validation, isolation, and error handling
│   └── utils/                 # Utility classes (crypto, jwt, appError, vite)
├── client/                    # React client built with Vite
│   ├── index.html             # Entry HTML
│   └── src/
│       ├── main.tsx           # React entry point
│       ├── App.tsx            # Main component & client routing
│       ├── _core/hooks/useAuth.ts # Authentication hook & state management
│       ├── components/        # React components
│       ├── contexts/          # React contexts
│       ├── hooks/             # Utility hooks
│       ├── lib/api.ts         # Fetch API wrapper client
│       └── pages/             # Page components (Home, Login, Signup, Dashboards)
├── shared/                    # Shared types & constants
└── drizzle/
    └── schema.ts              # Single source of truth for the database schema


---

## 3. Getting Started

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8 running locally

### Setup

\`\`\`bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

# 3. Synchronize database schema
npx drizzle-kit push

# 4. Start development server
npm run dev
\`\`\`

The application is available at: **http://localhost:5000**

---

## 4. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| \`DATABASE_URL\` | ✅ | — | MySQL connection string |
| \`JWT_SECRET\` | ✅ | — | Secret key for JWT signing |
| \`SUPER_ADMIN_EMAIL\` | ❌ | \`superadmin@byepo.com\` | Super admin login email |
| \`SUPER_ADMIN_PASSWORD\` | ❌ | \`SuperAdminPassword123!\` | Super admin login password |
| \`PORT\` | ❌ | \`5000\` | Server port |
| \`NODE_ENV\` | ❌ | \`development\` | \`development\` or \`production\` |
| \`JWT_EXPIRES_IN\` | ❌ | \`24h\` | Access token expiration duration |

---

## 5. API Overview

### Auth (\`/api/auth\`)
*   **POST** \`/signup\` - Registers a new organization and its admin user.
*   **POST** \`/login\` - Verifies credentials and returns access token.
*   **POST** \`/logout\` - Client-side logout by removing stored authentication token.
*   **GET** \`/me\` - Retrieves active user session info.

### Organizations (Super Admin Only, \`/api/organizations\`)
*   **GET** \`/\` - Lists all organizations.
*   **POST** \`/\` - Creates a new organization.
*   **GET** \`/:id\` - Retrieves organization details by ID.

### Feature Flags (Org Admin, \`/api/orgs/:orgId/flags\`)
*   **GET** \`/\` - Lists all flags.
*   **GET** \`/:flagId\` - Retrieves flag details.
*   **POST** \`/\` - Creates flag.
*   **PUT** \`/:flagId\` - Updates flag properties.
*   **DELETE** \`/:flagId\` - Deletes flag.

### Members (Org Admin, \`/api/orgs/:orgId/users\`)
*   **GET** \`/\` - Lists organization members.
*   **POST** \`/\` - Adds a new member user.

### Feature Checks (All Authenticated, \`/api/feature\`)
*   **POST** \`/check\` - Evaluates if a key is enabled. Returns \`{ key, enabled: boolean, found: boolean }\`.

---

## 6. Key Design Decisions

*   **Layered Architecture:** The application separation keeps routing, controllers, business services, and database queries in clean layers. Direct database queries from controllers are allowed for basic CRUD operations to reduce boilerplate.
*   **Tenant Isolation Middleware:** Tenant boundary check is executed at the routing layer before controllers are hit, preventing cross-organization parameter leakage.
*   **Single-Server Process:** Express serves the static React application bundle and mounts the REST API, avoiding CORS configuration overhead in production.

---

## 7. Screenshots

*(Screenshots can be added here to demonstrate the Landing Page, Super Admin Dashboard, Org Admin Dashboard, and User Flag Check Interface.)*
