# Files Added / Modified — Refactor Readable + Scalable

Struktur saat ini (pasca-refactor, Next.js 16 App Router + Supabase).
Lihat `docs/PRD.md` dan `docs/ERD.md` untuk konteks produk.

## Database
- `supabase/migrations/001_create_schema.sql` — schema awal (tabel, FK, index).
- `supabase/migrations/002_add_indexes.sql` — index status/produk untuk list pagination.
- `supabase/migrations/003_stock_views.sql` — `v_stok_produk`, `v_stok_bahan` (1 row per produk/bahan).
- `supabase/migrations/004_atomic_transactions.sql` — RPC `pay_bill`, `invoice_sales_order`, `confirm_quotation`.
- `scripts/seed_supabase.js` — wipe & reseed demo (`SUPABASE_SERVICE_ROLE_KEY`).
- `scripts/smoke.js` — smoke HTTP read-only: `node scripts/smoke.js [baseURL]` (38 cek: 200 + redirect).

> Semua migration `002–004` dijalankan manual sekali via Supabase SQL Editor (tidak ikut deploy).

## Frontend — fondasi
- `frontend/proxy.js` — refresh session Supabase per-request (konvensi `proxy` Next.js 16).
- `frontend/next.config.js` — redirects URL lama → baru (masa transisi).
- `frontend/lib/supabase/client.js` — browser client (`@supabase/ssr`).
- `frontend/lib/supabase/server.js` — server client fresh per-request.
- `frontend/lib/supabaseClient.js` — re-export legacy (jangan dipakai di kode baru).
- `frontend/lib/services/{pagination,manufacturing,purchase,sales,accounting,hr}.js` — query + `range/count`.
- `frontend/lib/utils/format.js` — `formatRupiah`, `shortId`.
- `frontend/components/ui/{Pagination,ActionButton}.jsx` — island klien generik.
- `frontend/components/{AppShell,Header,Sidebar}.jsx` — Sidebar auto-expand + penanda aktif.

## Frontend — rute (`app/(erp)/`, URL English plural)
- `manufacturing/{products,materials,boms,categories,production-orders}` — `page.jsx` (server list) + `[id]` + `new/` + `_components/` + `actions.js` bila ada mutasi.
- `purchase/{vendors,bills}`, `sales/{customers,quotations,sales-orders}`, `accounting/{customer-invoices,vendor-bills}`, `hr/{departments,employees}` — pola sama.
- `(erp)/layout.jsx` — teruskan children (shell tunggal dari root; TODO: pindahkan `<AppShell>` ke sini saat 100% rute di dalam `(erp)`).

## Catatan
- Tabel DB tetap Indonesia (`bahan`, `karyawan`, …); English hanya di URL + services.
- Total accounting = per halaman (label "Total halaman ini").
- Jangan commit `SUPABASE_SERVICE_ROLE_KEY`; simpan sebagai secret.
