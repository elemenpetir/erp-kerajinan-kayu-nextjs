'use client'

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase/client';

export default function Header({ onMobileToggle }) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-4 text-white sm:px-6">
      <div className="text-lg font-semibold uppercase tracking-[0.24em] text-slate-100">
        ERP Kerajinan Kayu
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 items-center rounded-lg border border-slate-700 bg-slate-900 px-4 text-sm text-slate-100 transition hover:bg-slate-800 mb-0"
        >
          Keluar
        </button>
        <button
          type="button"
          onClick={onMobileToggle}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-100 transition hover:bg-slate-800 lg:hidden"
          aria-label="Buka navigasi"
        >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>
      </div>
    </header>
  )
}
