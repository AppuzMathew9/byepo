import { eq, and } from "drizzle-orm";
import { getDb } from "../config/db";
import { users } from "../../drizzle/schema";

export type CreateUserDTO = typeof users.$inferInsert;
export type UpdateUserDTO = Partial<typeof users.$inferSelect>;

export class UserRepository {
  static async findByEmail(email: string) {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  static async findById(id: number) {
    const db = await getDb();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  static async create(userData: CreateUserDTO) {
    const db = await getDb();
    const [result] = await db.insert(users).values(userData);
    const insertId = result.insertId;
    return this.findById(insertId);
  }

  static async update(id: number, updates: UpdateUserDTO) {
    const db = await getDb();
    await db.update(users).set(updates).where(eq(users.id, id));
    return this.findById(id);
  }

  static async delete(id: number) {
    const db = await getDb();
    const user = await this.findById(id);
    if (!user) return null;
    await db.delete(users).where(eq(users.id, id));
    return user;
  }

  static async listAll() {
    const db = await getDb();
    return db.select().from(users);
  }

  static async listByOrg(organizationId: number) {
    const db = await getDb();
    return db.select().from(users).where(eq(users.organizationId, organizationId));
  }
}
