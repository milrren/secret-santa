import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import 'server-only';

/**
 * Server‑only Supabase client using the service role key.
 * This client bypasses Row Level Security and is intended for admin‑only
 * operations such as sending email notifications.
 */
export const getAdminSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase URL or Service Role Key not configured');
  }
  return createClient<Database>(url, serviceKey);
};

/** Returns true when the required env vars for the admin client are present. */
export const isAdminConfigured = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
};
