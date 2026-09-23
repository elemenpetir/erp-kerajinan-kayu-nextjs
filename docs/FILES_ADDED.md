# Files Added / Modified — Refactor Readable + Scalable

Struktur saat ini (pasca-refactor, Next.js 16 App Router + Supabase).
Lihat `docs/PRD.md` dan `docs/ERD.md` untuk konteks produk.

## Database — `supabase/migrations/`
- `001_create_schema.sql` — schema awal (tabel, FK, index).
- `002_add_indexes.sql` — index status/produk untuk list pagination.
- `003_stock_views.sql` — `v_stok_produk`, `v_stok_bahan` (1 row per produk/bahan).
- `004_atomic_transactions.sql` — RPC `pay_bill`, `invoice_sales_order`, `confirm_quotation`.
- `005_rls_policies.sql` — RLS aktif + policy untuk semua tabel.
- `006_drift_columns.sql` — kolom penyesuaian (drift) pada tabel transaksi.
- `007_document_codes.sql` — fungsi `docCode(prefix, kode, id)` untuk nomor dokumen.
- `008_unique_references.sql` — constraint unique pada referensi internal/barcode.
- `009_stock_views_rls.sql` — perbaikan view stok agar kompatibel RLS.
- `010_repairs.sql` — perbaikan data/skema pasca deployment.
- `011_storage_images.sql` — bucket Storage `produk-images` / `bahan-images` + policy upload.

> Migrasi `002–011` dijalankan manual sekali via Supabase SQL Editor (tidak ikut deploy).

## Scripts — root
- `scripts/seed_supabase.js` — wipe & reseed dummy data (16 produk, 15 bahan, 12 order produksi, 8 bills, 7 quotation, 5 sales order, 5 karyawan). Baca env dari `frontend/.env.local`, map `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`.
- `scripts/smoke.js` — smoke HTTP read-only: `node scripts/smoke.js [baseURL]` (38 cek: 200 + redirect).

## Frontend — fondasi
- `frontend/proxy.js` — refresh session Supabase per-request (`@supabase/ssr`, konvensi `proxy` Next.js 16).
- `frontend/next.config.js` — redirects URL lama → baru (masa transisi).
- `frontend/lib/supabase/client.js` — browser client (`@supabase/ssr`).
- `frontend/lib/supabase/server.js` — server client fresh per-request.
- `frontend/lib/supabaseClient.js` — re-export legacy (jangan dipakai di kode baru).
- `frontend/lib/services/{pagination,manufacturing,purchase,sales,accounting,hr}.js` — query + `range/count`; sort `created_at DESC` + tiebreaker `id DESC`.
- `frontend/lib/utils/format.js` — `formatRupiah`, `shortId`.
- `frontend/components/{AppShell,Header,Sidebar}.jsx` — Sidebar auto-expand + penanda aktif.

## Frontend — UI (shadcn klasik + turunan)
- Dasar shadcn: `button`, `card`, `input`, `label`, `table`, `badge`, `avatar`, `breadcrumb`, `dropdown-menu`, `alert-dialog`, `tabs`, `skeleton`, `sonner`, `NativeSelect`.
- Komponen sendiri: `RowActions.jsx` (menu ⋯, satu-satunya row action di semua list), `ActionButton.jsx`, `StatusBadge.jsx`, `PrintButton.jsx` (client, sembunyikan via `.no-print`), `ViewToggle.jsx`, `Pagination.jsx`, `TableSkeleton.jsx`, `EmptyState.jsx`, `DefinitionList.jsx`, `FilePicker.jsx`.

## Frontend — rute (`app/(erp)/`, URL English plural)
- `manufacturing/{products,materials,boms,categories,production-orders}` — `page.jsx` + `[id]` + `new/` + `_components/` + `actions.js`.
- `purchase/{vendors,bills}`, `sales/{customers,quotations,sales-orders}`, `accounting/{customer-invoices,vendor-bills}`, `hr/{departments,employees}` — pola sama.
- `reports/{stock,sales,finance}` — laporan dengan filter + Print.
- `(erp)/layout.jsx` — sudah membungkus children dengan `<AppShell>` (shell tunggal).

## Frontend — arsitektur hybrid
- Default: Server Components + Server Actions (`revalidatePath` / `router.refresh`).
- 3 pilot list = Client + SWR + API routes: Bills (`/api/bills`), Produk (`/api/products`), Stok (`/api/stock`) — filter instant tanpa reload.
- Auth: `@supabase/ssr` via `proxy.js`.

## Catatan
- Tabel DB tetap Indonesia (`bahan`, `karyawan`, …); English hanya di URL + services.
- Total accounting = per halaman (label "Total halaman ini").
- Jangan commit `SUPABASE_SERVICE_ROLE_KEY`; simpan sebagai secret.
- Screenshot README: `docs/screenshots/` (6 gambar).
