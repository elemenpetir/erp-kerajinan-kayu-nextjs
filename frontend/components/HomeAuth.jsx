'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase/client';

export default function HomeAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  if (!user) {
    return (
      <a className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-900" href="/login">
        Masuk
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-slate-900" href="/manufacturing/products">
        Buka Dashboard
      </a>
      <button
        type="button"
        className="inline-flex h-10 items-center rounded-lg border border-slate-700 px-4 text-sm text-slate-100"
        onClick={async () => {
          await supabase.auth.signOut();
          setUser(null);
          router.refresh();
        }}
      >
        Keluar
      </button>
    </div>
  );
}
