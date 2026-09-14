import HomeAuth from '../components/HomeAuth';

export default function Home() {
  return (
    <div>
      <header className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-950 px-4 py-4 text-white sm:px-6">
        <div className="text-lg font-semibold uppercase tracking-[0.24em] text-slate-100">
          ERP Kerajinan Kayu
        </div>
        <HomeAuth />
      </header>
      <main style={{ padding: 24 }}>
        <h1>ERP Portfolio — Next.js + Supabase</h1>
        <p>Modul contoh: <a href="/manufacturing/products">Manufaktur (CRUD Produk)</a></p>
      </main>
    </div>
  );
}
