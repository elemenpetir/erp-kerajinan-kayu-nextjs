# Frontend (Next.js 16) — ERP Portfolio

Quick start:

1. Install deps

```bash
cd frontend
npm install
```

2. Create `.env.local` from `.env.example` and set your Supabase project values

3. Run dev

```bash
npm run dev
```

Notes:

- Modules implemented: Manufaktur (Produk, Bahan, Kategori, BOM, Order Produksi), Purchase (Vendor, Bills), Sales (Customer, Quotation, Sales Orders), Accounting (Customer Invoice, Vendor Bill — read only), Employees (Departemen, Karyawan)
- Uses `@supabase/ssr` clients (browser + server); ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- For seeding demo data, run the seed script in repo root `scripts/seed_supabase.js` using your Supabase `SERVICE_ROLE` key.
