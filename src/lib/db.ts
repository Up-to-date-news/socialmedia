import { Pool } from "pg";

// A single pooled connection shared across API route invocations. Works
// against any standard Postgres connection string — local Postgres in dev,
// Vercel Postgres in production — so switching environments is just an
// env var change, no code change.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
