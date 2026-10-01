import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// Role dibaca dari payload JWT sesi (app_metadata) — lokal, nol request.
// Init sinkron dari localStorage (tanpa kedip); dijaga segar via onAuthStateChange.
// Default 'staff' (fail-closed di UI). Berubah saat login ulang (JWT baru).
function projectRef() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
  } catch {
    return '';
  }
}

function roleFromToken(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.app_metadata?.role || null;
  } catch {
    return null;
  }
}

function readRoleSync() {
  if (typeof window === 'undefined') return 'staff';
  try {
    const raw = window.localStorage.getItem(`sb-${projectRef()}-auth-token`);
    if (!raw) return 'staff';
    return roleFromToken(JSON.parse(raw)?.access_token) || 'staff';
  } catch {
    return 'staff';
  }
}

export function useRole() {
  const [role, setRole] = useState(readRoleSync);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const r = roleFromToken(data.session?.access_token);
      if (r) setRole(r);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const r = roleFromToken(session?.access_token);
      setRole(r || 'staff');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { role };
}
