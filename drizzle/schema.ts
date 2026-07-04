import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Organizations table - represents each tenant in the system
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Users table with role and organization association
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    name: text("name"),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: text("passwordHash").notNull(),
    role: mysqlEnum("role", ["super_admin", "org_admin", "user"])
      .default("user")
      .notNull(),
    organizationId: int("organizationId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("idx_organizationId").on(table.organizationId)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Feature flags table - scoped to organizations
 */
export const featureFlags = mysqlTable(
  "featureflags",
  {
    id: int("id").autoincrement().primaryKey(),
    organizationId: int("organizationId").notNull(),
    key: varchar("key", { length: 255 }).notNull(),
    description: text("description"),
    enabled: mysqlEnum("enabled", ["true", "false"]).default("false").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_organizationId").on(table.organizationId),
    index("idx_org_key").on(table.organizationId, table.key),
  ]
);

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
