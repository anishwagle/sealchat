import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Stores session in cookies (not localStorage) so both client
 * and server (proxy.ts) can access the same session.
 * Auto-refreshes tokens transparently.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
