# Frontend (Next.js 16) — ERP Portfolio

Quick start:

1. Install deps

```bash
cd frontend
npm install
```

2. Create `.env` from `.env.example` and set your Supabase project values

3. Run dev

```bash
npm run dev
```

Notes:
- Pages implemented: `/manufaktur` (list), `/manufaktur/create`, `/manufaktur/[id]` (view/edit/delete)
- Uses `@supabase/supabase-js` client; ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
- For seeding demo data, run the seed script in repo root `scripts/seed_supabase.js` using your Supabase `SERVICE_ROLE` key.
