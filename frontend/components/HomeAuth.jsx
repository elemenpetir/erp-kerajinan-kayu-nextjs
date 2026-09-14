'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase/client';

export default function HomeAuth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  // Satu kelas dasar untuk semua tombol: tinggi & tipografi identik,
  // beda hanya warna. Menghilangkan selisih <a> vs <button> dan ilusi kontras.
  const btn = 'inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold mb-0';

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  if (!user) {
    return (
      <a className={`${btn} bg-white text-slate-900`} href="/login">
        Masuk
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a className={`${btn} bg-white text-slate-900`} href="/manufacturing/products">
        Buka Dashboard
      </a>
      <button
        type="button"
        className={`${btn} bg-slate-800 text-slate-100`}
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
