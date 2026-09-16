-- Phase 5c: correctness repairs.
-- 1. Corrected NULL-kode backfill (007 computed MAX over NULL-only rows,
--    restarting numbering at 1 and risking collision). This version reads
--    MAX over the whole table. No-op when no NULL kode exists.
-- 2. Server-enforced line-item quantities (client validation is bypassable
--    via DevTools; CHECK cannot contain subqueries over jsonb, hence trigger).
-- 3. Bills require a vendor (only if no legacy NULLs exist).
-- 4. Single-row SUM aggregates (no 1000-row PostgREST cap on grand totals).
-- Run once in Supabase SQL Editor. Re-runnable.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bahan','produk','bills','bom','customer_company','customer_individual',
    'departemen','karyawan','order_produksi','quotation',
    'sales_order','vendor_company','vendor_individual'
  ]
  LOOP
    EXECUTE format(
      'WITH m AS (SELECT COALESCE(MAX(kode), 0) AS mx FROM %I),
       ranked AS (
         SELECT x.id, m.mx + ROW_NUMBER() OVER (ORDER BY x.created_at, x.id) AS new_kode
         FROM %I AS x CROSS JOIN m WHERE x.kode IS NULL
       )
       UPDATE %I AS t SET kode = ranked.new_kode
       FROM ranked WHERE t.id = ranked.id',
      t, t, t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION validate_positive_qty()
RETURNS trigger AS $$
DECLARE
  elem jsonb;
BEGIN
  FOR elem IN SELECT * FROM jsonb_array_elements(COALESCE(NEW.items, '[]'::jsonb))
  LOOP
    IF elem ->> 'jumlah' IS NULL OR elem ->> 'jumlah' !~ '^\d+(\.\d+)?$'
       OR (elem ->> 'jumlah')::numeric <= 0 THEN
      RAISE EXCEPTION 'Jumlah harus angka lebih dari 0';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bills_qty ON bills;
CREATE TRIGGER trg_bills_qty BEFORE INSERT OR UPDATE OF items ON bills
  FOR EACH ROW EXECUTE FUNCTION validate_positive_qty();

DROP TRIGGER IF EXISTS trg_quotation_qty ON quotation;
CREATE TRIGGER trg_quotation_qty BEFORE INSERT OR UPDATE OF items ON quotation
  FOR EACH ROW EXECUTE FUNCTION validate_positive_qty();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM bills WHERE vendor_id IS NULL) THEN
    ALTER TABLE bills ALTER COLUMN vendor_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'bills.vendor_id has legacy NULLs: NOT NULL skipped, clean data first';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION get_customer_invoices_total()
RETURNS numeric AS $$
  SELECT COALESCE(SUM(jumlah_pembayaran), 0) FROM customer_invoice;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_vendor_bills_total()
RETURNS numeric AS $$
  SELECT COALESCE(SUM(jumlah_pembayaran), 0) FROM vendor_bill;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION get_customer_invoices_total() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_vendor_bills_total() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_customer_invoices_total() TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_bills_total() TO authenticated;
