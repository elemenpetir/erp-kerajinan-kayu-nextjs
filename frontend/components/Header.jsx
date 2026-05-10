'use client'

export default function Header({ onMobileToggle }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-4 text-white sm:px-6">
      <div className="text-lg font-semibold uppercase tracking-[0.24em] text-slate-100">
        ERP Kerajinan Kayu
      </div>
      <button
        type="button"
        onClick={onMobileToggle}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-100 transition hover:bg-slate-800 sm:hidden"
        aria-label="Buka navigasi"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      </button>
    </header>
  )
}
