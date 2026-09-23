# Product Requirements Document (PRD)
## Rebuild ERP (Laravel → Next.js 16 + Supabase)

Tahun/Tanggal: 2026-05-09

**Pemilik proyek:** Pemilik portfolio (user)

## 1. Executive Summary

- Problem Statement: Aplikasi ERP lama berbasis Laravel 8 + MySQL (tanpa migration) perlu direbuild menjadi aplikasi modern untuk kebutuhan portfolio yang dapat di-deploy ke Vercel. Data produksi tidak perlu dimigrasi penuh—cukup skema dan seed demo.
- Proposed Solution: Rebuild frontend menggunakan Next.js 16 (App Router) dan gunakan Supabase (Postgres) sebagai backend-as-a-service (Auth, Database, Storage). Fokus MVP: 4 modul tampilkan fungsionalitas inti (Manufaktur, Purchase, Sales, Employees); Accounting hanya disertakan sebagai tabel/data ringkasan (implementasinya diskip di MVP).
- Success Criteria (ukur):
  1. Aplikasi dipublikasikan di Vercel dengan URL akses publik.
 2. Semua modul (Manufaktur, Purchase, Sales, Employees) menyediakan CRUD + listing dan minimal 1 demo flow end-to-end yang bisa dijalankan manual.
 3. Supabase Auth (email) aktif — user bisa signup/login.
 4. Database di Supabase berisi migrasi schema + seed (2–3 record per tabel) yang dapat dijalankan dari repositori.
 5. Dokumentasi runbook (README, migration, seed script) tersedia di repo.

## 2. User Experience & Functionality

### User Personas
- Pemilik/Viewer portfolio — menilai kemampuan teknis dan fitur ERP.
- Manajer Produksi — contoh alur membuat BOM dan order produksi.
- Purchasing — contoh alur RFQ → Bill → Pembayaran.
- Sales — contoh alur Quotation → Sales Order → Pembayaran.
- HR — mengelola departemen dan karyawan.

### User Stories (terukur)
- Manufaktur: Sebagai Manajer Produksi, saya ingin membuat `BOM` sehingga sistem dapat menghitung total biaya produk. Acceptance: form BOM menyimpan `components` ke `bom.components (jsonb)`; total_biaya_bahan dan total_biaya_produk merupakan angka yang dapat ditampilkan.
- Manufaktur: Sebagai Manajer Produksi, saya ingin membuat `Order Produksi` sehingga status produksi dapat berubah menjadi `Selesai`. Acceptance: order_produksi dengan status berubah mengikuti flow Draft → Konfirmasi → Dalam Proses → Selesai.
- Purchase: Sebagai Purchasing, saya ingin membuat `Vendor` dan `Bill` sehingga pembayaran dapat dicatat. Acceptance: `vendor_individual`/`vendor_company` CRUD; `bills` menyimpan `items` sebagai `jsonb`; `pembayaran_bill` menambahkan entry pembayaran.
- Sales: Sebagai Sales, saya ingin membuat `Quotation` dan mengkonversinya menjadi `Sales Order` sehingga pesanan dapat ditindaklanjuti. Acceptance: `quotation` → `sales_order` conversion tersedia; `pembayaran_sales_order` merekam pembayaran.
- Employees: Sebagai HR, saya ingin CRUD `departemen` & `karyawan` agar struktur organisasi ditampilkan. Acceptance: departemen & karyawan CRUD lengkap.

### Acceptance Criteria (umum)
- Halaman list menampilkan entri, mendukung pagination sederhana (batas 20 baris/halaman).
- Halaman create/edit menyimpan data ke Supabase dan menampilkan status sukses/gagal.
- Demo flow mampu dieksekusi dari mulai pembuatan entitas sampai status akhir tanpa error (manual QA pass).
- File gambar (produk/bahan) dapat diupload ke Supabase Storage (opsional untuk MVP — minimal menampilkan URL jika tidak diupload).

### Non-Goals
- Tidak menerapkan role-based permissions granular (hanya Supabase Auth email).
- Tidak membangun modul accounting komplek (Jurnal ganda, rekonsiliasi penuh) pada MVP.
- Tidak melakukan migrasi data massal dari MySQL produksi — hanya skema & seed demo.

## 3. AI System Requirements (Jika Berlaku)
- Tidak menggunakan AI untuk MVP. Jika di masa depan ingin summary transaksi atau rekomendasi harga, akan ditentukan tools dan metrik evaluasi (Precision/Recall tidak relevan di MVP).

## 4. Technical Specifications

### Arsitektur Overview
- Frontend: Next.js 16 (App Router). Server-side rendering / server actions bila perlu.
- Backend: Supabase (Postgres) menyediakan: Database, Auth (email), Storage (gambar), Realtime optional.
- Deployment: Frontend ke Vercel; Supabase project di akun user (free tier).

### Integration Points
- Client: `@supabase/supabase-js` (edge/runtime compatible). Gunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk klien.
- Admin/seed: `SUPABASE_SERVICE_ROLE_KEY` hanya untuk script seed/migration (tidak disimpan di repo).

### Database Schema Mapping (MySQL → Postgres)
(Ringkasan penting, semua kolom diturunkan dari schema MySQL yang diberikan dan dipetakan ke tipe Postgres yang sesuai. Nama tabel target ada di `supabase/migrations/001_create_schema.sql`.)

- Kategori: `tb_kategori(id_kategori, nama_kategori)` → `kategori(id UUID, nama TEXT)`
- Bahan: `tb_bahan(id_bahan, nama_bahan, biaya_bahan, harga_bahan, internal_referensi, gambar_bahan)` → `bahan(id UUID, nama TEXT, biaya NUMERIC, harga NUMERIC, internal_referensi TEXT, gambar_url TEXT)`
- Produk: `tb_produk(...)` → `produk(id UUID, nama TEXT, harga_produksi NUMERIC, biaya_produksi NUMERIC, internal_referensi TEXT, kategori_id UUID, barcode TEXT, gambar_url TEXT)`
- BOM: `tb_bom(...) nama_bahan(JSON), jumlah_bahan(JSON)` → `bom(components JSONB)` (array of {bahan_id, nama_bahan, jumlah, harga, satuan})
- Order Produksi: `tb_order(...) status` → `order_produksi(status TEXT CHECK(...))`
- Vendor / Customer: `vendor_individual`, `vendor_company`, `customer_individual`, `customer_company` dengan kolom serupa di-mapping.
- Quotation / Sales Order: `items` dan snapshot customer disimpan sebagai `jsonb`.
- Payments: `pembayaran_bill`, `pembayaran_sales_order` menyimpan `journal`, `jumlah_pembayaran`, `payment_date`, `catatan`.
- Employees: `departemen`, `karyawan` (`departemen_id` FK).

Catatan teknis: gunakan `gen_random_uuid()` (extension `pgcrypto`) untuk PK; JSON fields sebagai `jsonb` untuk query efisien.

### Migration & Seed
- File migrasi: `supabase/migrations/001_create_schema.sql` sudah ditambahkan ke repo.
- Seed script: `scripts/seed_supabase.js` menambahkan 2–3 contoh record per tabel. Script menggunakan `SUPABASE_SERVICE_ROLE_KEY`.
- Runbook singkat:
  1. Buat project Supabase dan aktifkan extension `pgcrypto`.
 2. Jalankan SQL migration (Supabase SQL editor) atau via psql.
 3. Set env vars dan jalankan seed:
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
node scripts/seed_supabase.js
```
 4. Frontend: salin `frontend/.env.example` → `frontend/.env.local` dan isi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Storage & Media
- Bucket contoh: `produk-images`, `bahan-images` di Supabase Storage. Simpan `gambar_url` pada tabel.

### Security & Auth
- Auth: Supabase Auth (email). Untuk portfolio cukup autentikasi dasar.
- RLS: untuk MVP bisa nonaktifkan; rekomendasi jangka menengah: aktifkan RLS dan buat policy read untuk authenticated users.
- Secrets: `SERVICE_ROLE_KEY` disimpan di Vercel / environment secrets.

### Observability
- Gunakan Supabase logs untuk DB, dan Vercel logs untuk frontend deployment. Tambahkan Sentry hanya jika diperlukan.

## 5. Risks & Roadmap

### Risiko Teknis & Mitigasi
- Schema ambiguity (MySQL tanpa migration): mitigasi — gunakan mapping konservatif, simpan JSON sebagai `jsonb`, seed kecil untuk validasi.
- Supabase free limits: mitigasi — batasi ukuran upload, gunakan seed minimal, monitor kuota.
- Kunci sensitif terekspos: mitigasi — jangan commit `SERVICE_ROLE_KEY`; simpan di environment provider.
- Edge runtime incompatibilities: mitigasi — gunakan `@supabase/supabase-js` versi edge-friendly atau gunakan server actions.

### Roadmap & Milestones
- MVP (2–3 minggu): setup Supabase, jalankan migration + seed; implement Manufaktur, Employees, Purchase, Sales (CRUD + demo flows); deploy ke Vercel.
- v1.1 (1–2 minggu): image upload (Storage), basic RLS, UX polish
- v2.0 (opsional): accounting features, reports, role-based access, CSV import/export

### Deliverables
- Repo GitHub dengan folder `frontend/` (Next.js 16), `supabase/migrations/`, `scripts/seed_supabase.js`, `docs/ERD.md`, `docs/PRD.md`.
- Deployable app on Vercel (public URL)
- Runbook singkat di `frontend/README.md` dan root README.

## Acceptance / Handoff Checklist (Untuk ditandai oleh pemilik)
- [x] Supabase project dibuat dan kredensial tersedia.
- [x] Migrations diterapkan di Supabase.
- [x] Seed script dijalankan; tiap tabel memiliki 2–3 record. (diperluas: 16 produk, 15 bahan, dst.)
- [x] Frontend `.env.local` terisi dan `npm run dev` berjalan.
- [ ] Deploy ke Vercel berhasil dan URL publik tersedia.
- [x] Manual E2E: jalankan demo flows untuk Manufaktur, Purchase, Sales, Employees.

---

