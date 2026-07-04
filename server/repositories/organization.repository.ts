import { eq } from "drizzle-orm";
import { getDb } from "../config/db";
import { organizations } from "../../drizzle/schema";

export class OrganizationRepository {
  static async findById(id: number) {
    const db = await getDb();
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return result[0] || null;
  }

  static async findByName(name: string) {
    const db = await getDb();
    const result = await db.select().from(organizations).where(eq(organizations.name, name)).limit(1);
    return result[0] || null;
  }

  static async create(name: string) {
    const db = await getDb();
    const [result] = await db.insert(organizations).values({ name });
    const insertId = result.insertId;
    return this.findById(insertId);
  }

  static async listAll() {
    const db = await getDb();
    return db.select().from(organizations);
  }
}
