# Files Added / Modified in This Session

Ringkasan file yang dibuat atau dimodifikasi selama sesi rebuild ke Next.js + Supabase.

## Database & Seed
- `supabase/migrations/001_create_schema.sql` — SQL migration untuk membuat schema Postgres (tabel, FK, index).
- `scripts/seed_supabase.js` — Script Node.js untuk menyisipkan seed demo (2–3 record/tabel) menggunakan `SUPABASE_SERVICE_ROLE_KEY`.

## Docs
- `docs/ERD.md` — ERD ringkas dan catatan desain.
- `docs/PRD.md` — PRD final (Bahasa Indonesia) berisi executive summary, user stories, technical spec, roadmap, risks, checklist.
- `docs/FILES_ADDED.md` — (file ini) ringkasan file sesi.

## Frontend (Next.js 16)
- `frontend/package.json` — package manifest untuk Next.js app.
- `frontend/next.config.js` — Next.js config (App Router enabled).
- `frontend/.env.example` — contoh environment variables.
- `frontend/README.md` — panduan run & notes untuk frontend.
- `frontend/lib/supabaseClient.js` — wrapper `@supabase/supabase-js` client.

### Layout & UI
- `frontend/app/layout.jsx` — Root layout menggunakan `Header`.
- `frontend/components/Header.jsx` — Header client-side termasuk mobile hamburger toggle.
- `frontend/app/globals.css` — global styles + responsive menu styles.
- `frontend/app/page.jsx` — homepage.

### Modul Manufaktur
- `frontend/app/manufaktur/page.jsx` — list produk.
- `frontend/app/manufaktur/create/page.jsx` — form create produk.
- `frontend/app/manufaktur/[id]/page.jsx` — detail / edit / delete produk.

### Modul Employees
- `frontend/app/employees/departemen/page.jsx` — create + list departemen.
- `frontend/app/employees/karyawan/page.jsx` — list karyawan.
- `frontend/app/employees/karyawan/create/page.jsx` — create karyawan.
- `frontend/app/employees/karyawan/[id]/page.jsx` — detail / edit / delete karyawan.

### Modul Purchase
- `frontend/app/purchase/vendors/page.jsx` — list vendor individual.
- `frontend/app/purchase/vendors/create/page.jsx` — create vendor.
- `frontend/app/purchase/vendors/[id]/page.jsx` — vendor detail.
- `frontend/app/purchase/bills/page.jsx` — list bills.
- `frontend/app/purchase/bills/create/page.jsx` — create bill (simple form).

### Modul Sales
- `frontend/app/sales/customers/page.jsx` — list customers.
- `frontend/app/sales/customers/create/page.jsx` — create customer.
- `frontend/app/sales/customers/[id]/page.jsx` — customer detail.
- `frontend/app/sales/quotation/page.jsx` — list quotations.
- `frontend/app/sales/quotation/create/page.jsx` — create quotation (items JSONB, total calculation).
- `frontend/app/sales/orders/page.jsx` — list sales orders.
- `frontend/app/sales/orders/create/page.jsx` — convert quotation to sales order.

## Catatan
- Semua frontend berada di folder `frontend/` — jika dipindah ke `erp-nextjs/`, sesuaikan root di Vercel.
- Jangan commit `SUPABASE_SERVICE_ROLE_KEY`; simpan sebagai secret di Vercel atau lingkungan lokal.
