import { eq, and } from "drizzle-orm";
import { getDb } from "../config/db";
import { featureFlags } from "../../drizzle/schema";

export type CreateFlagDTO = typeof featureFlags.$inferInsert;
export type UpdateFlagDTO = Partial<typeof featureFlags.$inferSelect>;

export class FeatureFlagRepository {
  static async findById(id: number) {
    const db = await getDb();
    const result = await db.select().from(featureFlags).where(eq(featureFlags.id, id)).limit(1);
    return result[0] || null;
  }

  static async findByKeyAndOrg(organizationId: number, key: string) {
    const db = await getDb();
    const result = await db
      .select()
      .from(featureFlags)
      .where(and(eq(featureFlags.organizationId, organizationId), eq(featureFlags.key, key)))
      .limit(1);
    return result[0] || null;
  }

  static async create(flagData: CreateFlagDTO) {
    const db = await getDb();
    const [result] = await db.insert(featureFlags).values(flagData);
    const insertId = result.insertId;
    return this.findById(insertId);
  }

  static async update(id: number, updates: UpdateFlagDTO) {
    const db = await getDb();
    await db.update(featureFlags).set(updates).where(eq(featureFlags.id, id));
    return this.findById(id);
  }

  static async delete(id: number) {
    const db = await getDb();
    const flag = await this.findById(id);
    if (!flag) return null;
    await db.delete(featureFlags).where(eq(featureFlags.id, id));
    return flag;
  }

  static async listByOrg(organizationId: number) {
    const db = await getDb();
    return db.select().from(featureFlags).where(eq(featureFlags.organizationId, organizationId));
  }
}
