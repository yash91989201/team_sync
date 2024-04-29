import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { DrizzleMySQLAdapter } from "@lucia-auth/adapter-drizzle";
// UTILS
import { env } from "@/env";
// TYPES
import type { Pool } from "mysql2/promise";
// DB TABLES
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const conn = globalForDb.conn ?? createPool({ uri: env.DATABASE_URL });
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema, mode: "default", logger: true });

export const luciaDbAdapter = new DrizzleMySQLAdapter(
  db,
  schema.sessionTable,
  schema.userTable,
);
