import { Pool } from "pg";

/**
 * Standalone Postgres client for Supabase.
 * Used only for new features (waitlist, etc.) while the rest of the app
 * continues to use MySQL. Will eventually replace MySQL entirely.
 */
const supabasePool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  max: 5,
});

export default supabasePool;
