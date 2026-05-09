-- Supabase/Postgres schema migration for ERP rebuild
-- Enables pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Kategori
CREATE TABLE IF NOT EXISTS kategori (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bahan
CREATE TABLE IF NOT EXISTS bahan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  biaya NUMERIC(12,2),
  harga NUMERIC(12,2),
  internal_referensi TEXT,
  gambar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Produk
CREATE TABLE IF NOT EXISTS produk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  harga_produksi NUMERIC(12,2),
  biaya_produksi NUMERIC(12,2),
  internal_referensi TEXT,
  kategori_id UUID REFERENCES kategori(id) ON DELETE SET NULL,
  barcode TEXT,
  gambar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- BOM (Bill of Materials)
CREATE TABLE IF NOT EXISTS bom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produk_id UUID REFERENCES produk(id) ON DELETE CASCADE,
  kategori_id UUID REFERENCES kategori(id) ON DELETE SET NULL,
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  jumlah_produk INTEGER DEFAULT 1,
  internal_referensi TEXT,
  total_biaya_produk NUMERIC(12,2),
  total_biaya_bahan NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order Produksi
CREATE TABLE IF NOT EXISTS order_produksi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bom_id UUID REFERENCES bom(id) ON DELETE SET NULL,
  produk_id UUID REFERENCES produk(id) ON DELETE SET NULL,
  jumlah_produk INTEGER DEFAULT 1,
  components JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Draft',
  CHECK (status IN ('Draft','Konfirmasi','Dalam Proses','Selesai')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors (individual & company)
CREATE TABLE IF NOT EXISTS vendor_individual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nama_perusahaan TEXT,
  alamat TEXT,
  telp TEXT,
  email TEXT,
  posisi_pekerjaan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  alamat TEXT,
  telp TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RFQ
CREATE TABLE IF NOT EXISTS rfq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  items JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  referensi_vendor TEXT,
  deadline_order DATE,
  accounting_date DATE,
  jenis_pembayaran TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total_biaya NUMERIC(14,2),
  status TEXT DEFAULT 'Draft Bill',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pembayaran Bill
CREATE TABLE IF NOT EXISTS pembayaran_bill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  journal TEXT,
  jumlah_pembayaran NUMERIC(14,2),
  payment_date DATE,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customer_individual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nama_perusahaan TEXT,
  alamat TEXT,
  telp TEXT,
  email TEXT,
  posisi_pekerjaan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  alamat TEXT,
  telp TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quotation
CREATE TABLE IF NOT EXISTS quotation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  customer_snapshot JSONB,
  expiration DATE,
  payment_terms TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total_biaya NUMERIC(14,2),
  status TEXT DEFAULT 'Quotation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sales Order
CREATE TABLE IF NOT EXISTS sales_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotation(id) ON DELETE SET NULL,
  customer_id UUID,
  customer_snapshot JSONB,
  expiration DATE,
  payment_terms TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total_biaya NUMERIC(14,2),
  status TEXT DEFAULT 'Nothing to Invoice',
  status_delivery TEXT DEFAULT 'Sedang Dikirim',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pembayaran Sales Order
CREATE TABLE IF NOT EXISTS pembayaran_sales_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID REFERENCES sales_order(id) ON DELETE CASCADE,
  journal TEXT,
  status TEXT,
  jumlah_pembayaran NUMERIC(14,2),
  payment_date DATE,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Invoice & Vendor Bill (accounting summary tables)
CREATE TABLE IF NOT EXISTS customer_invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID,
  jumlah_pembayaran NUMERIC(14,2),
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_bill (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id UUID,
  jumlah_pembayaran NUMERIC(14,2),
  payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Departments & Employees
CREATE TABLE IF NOT EXISTS departemen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_departemen TEXT NOT NULL,
  manager TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS karyawan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departemen_id UUID REFERENCES departemen(id) ON DELETE SET NULL,
  nama TEXT NOT NULL,
  posisi TEXT,
  telp TEXT,
  email TEXT,
  manager TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_produk_kategori_id ON produk(kategori_id);
CREATE INDEX IF NOT EXISTS idx_bom_produk_id ON bom(produk_id);
