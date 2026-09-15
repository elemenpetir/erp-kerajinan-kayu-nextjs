-- Phase 5: reconcile repo migrations with production drift.
-- Evidence: information_schema (17 tables) + pg_typeof (kode = integer).
-- Run once in Supabase SQL Editor. Idempotent (safe to re-run).

-- 1. kode INTEGER on 13 tables (seed writes ints; UI uses shortId(id))
ALTER TABLE bahan ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE produk ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE bom ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE customer_company ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE customer_individual ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE departemen ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE karyawan ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE order_produksi ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE quotation ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE sales_order ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE vendor_company ADD COLUMN IF NOT EXISTS kode INTEGER;
ALTER TABLE vendor_individual ADD COLUMN IF NOT EXISTS kode INTEGER;

-- 2. FK columns used by RPCs (004) and PostgREST embeds (accounting.js)
ALTER TABLE customer_invoice ADD COLUMN IF NOT EXISTS sales_order_id uuid;
ALTER TABLE vendor_bill ADD COLUMN IF NOT EXISTS bill_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_invoice_sales_order') THEN
    ALTER TABLE customer_invoice
      ADD CONSTRAINT fk_customer_invoice_sales_order
      FOREIGN KEY (sales_order_id) REFERENCES sales_order(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_vendor_bill_bill') THEN
    ALTER TABLE vendor_bill
      ADD CONSTRAINT fk_vendor_bill_bill
      FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL;
  END IF;
END $$;

-- NOTE: legacy reference_id columns are intentionally left untouched.
