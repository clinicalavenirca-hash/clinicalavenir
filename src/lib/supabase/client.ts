'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

/**
 * Browser Supabase client. Returns null when env vars are not configured,
 * so callers can fall back to mock data without crashing the app.
 */
export function supabaseBrowser(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    cached = null;
    return null;
  }
  cached = createBrowserClient(url, anon);
  return cached;
}
