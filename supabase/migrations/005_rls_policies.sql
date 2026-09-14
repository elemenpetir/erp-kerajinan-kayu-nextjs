-- Phase 4: Row Level Security. Portfolio-simple model:
-- authenticated users = full access, anon = auth only.
-- Run once in Supabase SQL Editor.

-- 1. Grants (idempotent; covers tables created without explicit grants)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- 2. Enable RLS + one permissive policy per table for authenticated
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'kategori','bahan','produk','bom','order_produksi',
    'vendor_individual','vendor_company','rfq','bills','pembayaran_bill',
    'customer_individual','customer_company','quotation','sales_order',
    'pembayaran_sales_order','customer_invoice','vendor_bill',
    'departemen','karyawan'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all ON %I', t);
    EXECUTE format(
      'CREATE POLICY authenticated_all ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      t);
  END LOOP;
END $$;

-- 3. RPCs must bypass RLS (they enforce their own status guards):
-- SECURITY DEFINER + locked search_path, executable by authenticated only
ALTER FUNCTION pay_bill(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION invoice_sales_order(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION confirm_quotation(uuid) SECURITY DEFINER SET search_path = public;
REVOKE ALL ON FUNCTION pay_bill(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION invoice_sales_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION confirm_quotation(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION pay_bill(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION invoice_sales_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_quotation(uuid) TO authenticated;
