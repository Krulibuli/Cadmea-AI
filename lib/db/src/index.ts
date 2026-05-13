import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

export const databaseConfigured = Boolean(databaseUrl);
export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

function createUnavailableDb() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error("DATABASE_URL is not configured. Using public-data fallback instead.");
      },
    },
  ) as ReturnType<typeof drizzle<typeof schema>>;
}

export const db = pool ? drizzle(pool, { schema }) : createUnavailableDb();

export async function canUseDatabase(): Promise<boolean> {
  if (!pool) return false;
  try {
    await pool.query("select 1");
    return true;
  } catch {
    return false;
  }
}

export * from "./schema";
