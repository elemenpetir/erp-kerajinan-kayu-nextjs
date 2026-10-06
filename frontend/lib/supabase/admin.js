import { createClient } from '@supabase/supabase-js';

// Klien service_role EKSKLUSIF sisi-server (Admin API: list/update user).
// Jangan pernah impor file ini dari Client Component — key tak punya prefix
// NEXT_PUBLIC_ sehingga tak terbawa ke browser, tapi tetap: server only.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diset (cek .env.local / Vercel env)');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
