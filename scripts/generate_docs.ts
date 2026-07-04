// scripts/generate_docs.ts
// Generates accurate, implementation-aligned project documentation for Byepo Feature Flags.

import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, "PROJECT_DOCUMENTATION.md");

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function sectionOverview(): string {
  return `# Multi-Tenant Feature Flag Management System — Project Documentation

This document describes the design, architecture, database schema, and API reference for the **Multi-Tenant Feature Flag Management System**, matching the implementation.

---

## 1. Project Overview

The **Byepo Feature Flag Management System** is a multi-tenant web application designed to manage feature flags across organizations.

*   **Super Admin:** Manages organizations.
*   **Org Admin:** Creates and toggles feature flags for their organization, and manages users.
*   **End User:** Queries if a feature flag is enabled for their assigned organization.

---

## 2. Tech Stack

*   **Backend Framework:** Node.js, Express, TypeScript
*   **Database:** MySQL 8, Drizzle ORM
*   **Authentication & Security:** JWT (HS256 tokens via \`jose\`), bcryptjs (12 rounds)
*   **Frontend:** React, Vite, Tailwind CSS, \`wouter\` (routing), \`sonner\` (toasts), Radix UI (primitives)

---

## 3. Architecture Overview

The application follows a layered architecture. Most business operations pass through the Service layer, while simple CRUD operations directly use the Repository layer to reduce unnecessary abstraction.

*   **Routes:** Defines endpoints and applies authentication, role-based authorization, tenant isolation, and schema validation middleware.
*   **Controllers:** Parse incoming request bodies/parameters and return responses.
*   **Services:** Handle core business rules and state changes (e.g., authentication).
*   **Repositories:** Directly execute database select, insert, update, and delete queries using Drizzle.

---

## 4. Folder Structure

\`\`\`
byepo-feature-flags/
├── server/
│   ├── app.ts                 # Express configuration, global middleware, & route mounting
│   ├── server.ts              # HTTP server start, database connection, & dev/prod asset serving
│   ├── config/
│   │   ├── db.ts              # MySQL connection pool singleton via Drizzle
│   │   └── env.ts             # Environment validation using Zod
│   ├── controllers/           # Express route handlers
│   │   ├── auth.controller.ts
│   │   ├── featureFlag.controller.ts
│   │   ├── organization.controller.ts
│   │   └── user.controller.ts
│   ├── services/              # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── featureFlag.service.ts
│   │   └── organization.service.ts
│   ├── repositories/          # Drizzle queries & database operations
│   │   ├── user.repository.ts
│   │   ├── organization.repository.ts
│   │   └── featureFlag.repository.ts
│   ├── routes/                # Express Route files
│   │   ├── auth.routes.ts
│   │   ├── organization.routes.ts
│   │   ├── featureFlag.routes.ts
│   │   └── user.routes.ts
│   ├── middleware/            # Auth, validation, isolation, and error handling
│   │   ├── authenticate.ts    # Extracts and verifies Bearer JWTs, sets req.user
│   │   ├── authorize.ts       # Role-based access control factory
│   │   ├── tenantIsolation.ts # Enforces tenant bounds & requires assigned organization
│   │   ├── validate.ts        # Validates express-validator outputs (returns 422 on fail)
│   │   └── errorHandler.ts    # Centralized Express error handler mapping operational errors
│   └── utils/
│       ├── crypto.ts          # Hashing helper using bcryptjs with 12 salt rounds
│       ├── jwt.ts             # JWT token signing & verification wrapper
│       ├── appError.ts        # Typed custom error utility class
│       └── vite.ts            # Vite integration (dev) & static asset serving (prod)
├── client/                    # React client built with Vite
│   ├── index.html             # Entry HTML
│   └── src/
│       ├── main.tsx           # React entry point
│       ├── App.tsx            # Main component & client routing
│       ├── index.css          # Global styles
│       ├── const.ts           # Client constants
│       ├── _core/
│       │   └── hooks/
│       │       └── useAuth.ts # Authentication hook & state management
│       ├── components/        # React components
│       ├── contexts/
│       │   └── ThemeContext.tsx # Light/dark mode context provider
│       ├── hooks/             # Utility hooks
│       ├── lib/
│       │   ├── api.ts         # Fetch API wrapper client
│       │   └── utils.ts       # Tailwind merging utility
│       └── pages/             # Page components (Home, Login, Signup, Dashboards)
├── shared/                    # Shared types & constants
│   ├── const.ts
│   └── types.ts
└── drizzle/
    └── schema.ts              # Single source of truth for the database schema
\`\`\`

---

## 5. Setup Instructions

1.  **Install dependencies:**
    \`\`\`bash
    pnpm install
    \`\`\`
2.  **Configure environment:** Create a \`.env\` file in the root directory.
    \`\`\`env
    DATABASE_URL=mysql://username:password@localhost:3306/database_name
    JWT_SECRET=your_jwt_signature_secret_key
    JWT_EXPIRES_IN=24h
    SUPER_ADMIN_EMAIL=superadmin@byepo.com
    SUPER_ADMIN_PASSWORD=SuperAdminPassword123!
    PORT=5000
    NODE_ENV=development
    \`\`\`
3.  **Synchronize database schema:**
    \`\`\`bash
    npx drizzle-kit push
    \`\`\`
4.  **Run development server:**
    \`\`\`bash
    npm run dev
    \`\`\`

---

## 6. Environment Variables

*   \`NODE_ENV\`: Application environment (\`development\`, \`production\`, or \`test\`).
*   \`PORT\`: Port on which the HTTP server listens.
*   \`DATABASE_URL\`: Fully qualified MySQL connection URI.
*   \`JWT_SECRET\`: Signing key for generating secure HMAC tokens.
*   \`JWT_EXPIRES_IN\`: Access token duration (\`24h\` default).

---

## 7. Database Schema

The schema resides in \`drizzle/schema.ts\`:

### 1. \`organizations\` Table
*   \`id\` (\`int\`, Primary Key, Auto-increment)
*   \`name\` (\`varchar(255)\`, Unique, Not Null)
*   \`createdAt\` (\`timestamp\`, Default Now, Not Null)
*   \`updatedAt\` (\`timestamp\`, Default Now, On Update Now, Not Null)

### 2. \`users\` Table
*   \`id\` (\`int\`, Primary Key, Auto-increment)
*   \`name\` (\`text\`, Nullable)
*   \`email\` (\`varchar(320)\`, Unique, Not Null)
*   \`passwordHash\` (\`text\`, Not Null)
*   \`role\` (\`mysqlEnum(["super_admin", "org_admin", "user"])\`, Default \`"user"\`, Not Null)
*   \`organizationId\` (\`int\`, Nullable, Foreign Key -> \`organizations.id\`)

### 3. \`featureflags\` Table
*   \`id\` (\`int\`, Primary Key, Auto-increment)
*   \`organizationId\` (\`int\`, Not Null, Foreign Key -> \`organizations.id\`)
*   \`key\` (\`varchar(255)\`, Not Null)
*   \`description\` (\`text\`, Nullable)
*   \`enabled\` (\`mysqlEnum(["true", "false"])\`, Default \`"false"\`, Not Null)
*   \`createdAt\` (\`timestamp\`, Default Now, Not Null)
*   \`updatedAt\` (\`timestamp\`, Default Now, On Update Now, Not Null)

---

## 8. API Endpoints

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

## 9. Authentication & Authorization

### Tenant Isolation
Isolation is enforced globally at the route level:
*   Any request matching \`/api/orgs/:orgId/*\` runs \`tenantIsolation\` middleware.
*   The middleware checks if the decoded token's \`organizationId\` matches the requested \`:orgId\` parameter.
*   If they do not match, it returns a \`403 Forbidden\` error.
*   Super admins skip this validation.

---

## 10. Design Decisions

*   **Layered Architecture (Repository → Service → Controller):** Separates endpoint handling, business operations, and database operations.
*   **JWT Authentication:** Handles authorization in a stateless manner via standard bearer tokens.
*   **Tenant Isolation Middleware:** Guards organization-specific data checks early in the request lifecycle.
*   **Shared React Frontend:** Serves the client SPA from the same process using client-side role-based routing.
*   **Drizzle ORM:** Handles SQL generation and validation in a type-safe manner.

---

## 11. Future Improvements

*   **Search and filtering:** Support lookup for organizations in the Super Admin dashboard.
*   **Pagination:** Add paging capabilities for user list and flags list.
*   **Feature Flag Audit History:** Track flag state updates and key modifications.
*   **Testing suite:** Add unit and integration test coverages.
*   **Docker configuration:** Containerize database and application server layers.
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function generateDocumentation(): void {
  const doc = [
    sectionOverview(),
  ].join("\n");

  fs.writeFileSync(OUT_PATH, doc, "utf-8");
  console.log("Documentation generated at", OUT_PATH);
}

generateDocumentation();
