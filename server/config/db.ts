import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from "./env";
import * as schema from "../../drizzle/schema";

let connection: mysql.Connection | null = null;
let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  try {
    connection = await mysql.createConnection(ENV.DATABASE_URL);
    dbInstance = drizzle(connection, { schema, mode: "default" });
    return dbInstance;
  } catch (error) {
    console.error("💥 Failed to connect to database:", error);
    throw error;
  }
}
