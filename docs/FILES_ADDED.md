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
- `012_audit_log.sql` — tabel `audit_log` + trigger `log_audit()` (SECURITY DEFINER) di 19 tabel bisnis; RLS SELECT-only. Aktor dari JWT (null = service role/seed).
- `013_rbac.sql` — RBAC 3 role (`app_role()` dari JWT **app_metadata**): ganti `authenticated_all` → `rbac_select/insert/update/delete_admin/delete_staff` di 19 tabel; guard manager di 3 RPC; syarat `!= manager` di policy tulis Storage.
- `014_order_cancel_status.sql` — tambah `'Batal'` ke CHECK `order_produksi.status` (cancel flow).
- `015_stock_guards.sql` — `confirm_quotation` tolak item melebihi stok produk (`v_stok_produk`); guard bahan di action advance (Konfirmasi→Dalam Proses).

> Migrasi `002–015` dijalankan manual sekali via Supabase SQL Editor (tidak ikut deploy).

## Scripts — root
- `scripts/seed_supabase.js` — wipe & reseed dummy data (16 produk, 15 bahan, 12 order produksi, 8 bills, 7 quotation, 5 sales order, 5 karyawan). Baca env dari `frontend/.env.local`, map `NEXT_PUBLIC_SUPABASE_URL` → `SUPABASE_URL`.
- `scripts/smoke.js` — smoke HTTP read-only: `node scripts/smoke.js [baseURL]` (38 cek: 200 + redirect).

## Frontend — fondasi
- `frontend/proxy.js` — refresh session Supabase per-request (`@supabase/ssr`, konvensi `proxy` Next.js 16) + verifikasi JWT lokal via `jose`.
- `frontend/next.config.js` — redirects URL lama → baru (masa transisi).
- `frontend/lib/supabase/client.js` — browser client (`@supabase/ssr`).
- `frontend/lib/supabase/server.js` — server client fresh per-request.
- `frontend/hooks/useList.js` — satu-satunya SWR hook list client (key dari entity + params).
- `frontend/app/api/lists/[entity]/route.js` — endpoint tunggal semua list (allowlist entity → service; enrich stok bahan + stok/bom produk, opsi karyawan departemen, grandTotal accounting, filter sales-report & stock-report).
- `frontend/lib/supabaseClient.js` — re-export legacy (jangan dipakai di kode baru).
- `frontend/lib/services/{pagination,manufacturing,purchase,sales,accounting,hr}.js` — query + `range/count`; sort `created_at DESC` + tiebreaker `id DESC`.
- `frontend/lib/utils/format.js` — `formatRupiah`, `shortId`.
- `frontend/components/{AppShell,Header,Sidebar}.jsx` — Sidebar auto-expand + penanda aktif.

## Frontend — UI (shadcn klasik + turunan)
- Dasar shadcn: `button`, `card`, `input`, `label`, `table`, `badge`, `avatar`, `breadcrumb`, `dropdown-menu`, `alert-dialog`, `tabs`, `skeleton`, `sonner`, `NativeSelect`.
- Komponen sendiri: `RowActions.jsx` (menu ⋯, satu-satunya row action di semua list), `ActionButton.jsx`, `StatusBadge.jsx`, `PrintButton.jsx` (client, sembunyikan via `.no-print`), `ViewToggle.jsx`, `Pagination.jsx`, `TableSkeleton.jsx`, `EmptyState.jsx`, `DefinitionList.jsx`, `FilePicker.jsx`, `SearchForm.jsx` (search + spinner busy + Reset), `ExportButtons.jsx` (CSV semua list, PDF laporan; mode entity-fetch atau rows langsung), `StockBell.jsx` (badge kritis + toast habis, polling 60 dtk).
- Ekspor: `lib/exportCsv.js` (tanpa dep; `;`, BOM, escape kutip), `lib/exportPdf.js` (`jspdf` + `jspdf-autotable`, dynamic import saat klik); `/api/lists` terima `limit` → `pageSize` (cap 2000) untuk full filtered set.

## Frontend — rute (`app/(erp)/`, URL English plural)
- `manufacturing/{products,materials,boms,categories,production-orders}` — `page.jsx` + `[id]` + `new/` + `_components/` + `actions.js`.
- `purchase/{vendors,bills}`, `sales/{customers,quotations,sales-orders}`, `accounting/{customer-invoices,vendor-bills}`, `hr/{departments,employees}` — pola sama.
- `reports/{stock,sales,finance}` — laporan dengan filter + Print.
- `reports/activity` — viewer jejak audit (`audit_log`): Waktu/Aktor/Aksi/Entitas + `<details>` field berubah.
- `settings/roles` — kelola role admin/manager/staff (admin-only): tabel user + dropdown role;
  API `/api/admin/users` (service key server-only, gate admin, tolak demosi diri + admin-terakhir,
  audit eksplisit); sidebar seksi Pengaturan; proxy redirect non-admin.
- Cancel flow: `cancelProductionOrder` (Draft/Konfirmasi/Dalam Proses → Batal) + `cancelSalesOrder`
  (To Invoice + belum Terkirim → Batal); aksi Batalkan di list + detail; finance exclude Batal dari piutang.
- `(erp)/layout.jsx` — sudah membungkus children dengan `<AppShell>` (shell tunggal).

## Frontend — arsitektur list
- Semua list halaman = Client Component + SWR (`useList`) → `/api/lists/[entity]`: customers, quotations, sales-orders, vendors, departments, employees, boms, materials, categories, production-orders, customer-invoices, vendor-bills, bills, products, sales-report, stock-report, audit-log.
- Search `q` di 13 list (kolom nama/kode/referensi per entity; quotations/sales-orders termasuk `customer_snapshot->>nama`); sanitizer `cleanQ()` di `lib/services/pagination.js`. Accounting (nama bersarang + total tak terfilter) dan laporan tanpa filter dikecualikan.
- Detail/form tetap Server Components + Server Actions (`revalidatePath` / `router.refresh`).
- RBAC: `admin` penuh; `manager` read-only; `staff` operasional tanpa baca finansial + tanpa hapus master.
  Role di JWT `app_metadata` (set via Admin API/SQL, cth. demo user → admin); helper SQL `app_role()`.
  Frontend baca via `hooks/useRole.js` (nol request) + `lib/permissions.js`; `RowActions` filter aksi per `entity`;
  proxy redirect staff dari `/reports/finance` + manager dari `*/new`. Enforcement riil = RLS.
- Laporan Keuangan tetap Server Component (snapshot print, tanpa filter); landing `/` statis.
- Auth: `@supabase/ssr` via `proxy.js`.

## Catatan
- Tabel DB tetap Indonesia (`bahan`, `karyawan`, …); English hanya di URL + services.
- Total accounting = per halaman (label "Total halaman ini").
- Jangan commit `SUPABASE_SERVICE_ROLE_KEY`; simpan sebagai secret.
- Screenshot README: `docs/screenshots/` (6 gambar).
