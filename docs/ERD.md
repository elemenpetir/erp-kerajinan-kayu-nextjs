# ERD Ringkas — Rebuild ERP ke Next.js + Supabase

Ringkasan entitas utama dan relasi singkat (mengacu pada schema migrasi):

- `kategori` 1—N `produk`
- `produk` 1—N `bom`
- `bom` 1—N `order_produksi`
- `vendor_individual` / `vendor_company` → digunakan oleh `rfq` dan `bills`
- `customer_individual` / `customer_company` → digunakan oleh `quotation` dan `sales_order`
- `quotation` 1—1 `sales_order` (opsional, dikaitkan lewat `quotation_id`)
- `sales_order` 1—N `pembayaran_sales_order`
- `bills` 1—N `pembayaran_bill`
- `departemen` 1—N `karyawan`

Catatan desain:
- Banyak kolom yang sebelumnya berupa JSON (contoh: `nama_bahan(JSON)`, `jumlah_bahan(JSON)`) dimapping ke `jsonb` di Postgres untuk fleksibilitas.
- Primary key menggunakan `UUID` (`gen_random_uuid()`), memudahkan sinkronisasi dan referensi antar layanan.
- Media (gambar produk/bahan) disimpan di Supabase Storage; tabel hanya menyimpan `gambar_url`.
- Untuk demo portfolio, banyak relasi dibuat permissive (ON DELETE SET NULL) agar seeding dan penghapusan tidak menyebabkan cascade besar.

Rekomendasi ERD visual: gunakan tool seperti dbdiagram.io atau draw.io mengimpor tabel dari file SQL `supabase/migrations/001_create_schema.sql`.
