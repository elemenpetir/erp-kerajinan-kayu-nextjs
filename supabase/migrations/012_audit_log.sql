-- 012_audit_log.sql — jejak mutasi semua tabel bisnis (INSERT/UPDATE/DELETE).
-- Dijalankan manual sekali via Supabase SQL Editor (seperti 002-011).
-- Aktor dibaca dari JWT pemanggil (auth.uid / email); null = service role/seed.

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID NULL,
  actor_email TEXT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  entity TEXT NOT NULL,
  entity_id UUID NULL,
  diff JSONB NULL
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at DESC);

-- Fungsi trigger: SECURITY DEFINER agar INSERT log lolos RLS audit_log.
CREATE OR REPLACE FUNCTION log_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_log (actor_id, actor_email, action, entity, entity_id, diff)
  VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    TG_OP,
    TG_TABLE_NAME,
    COALESCE((NEW).id, (OLD).id),
    jsonb_strip_nulls(jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW)))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

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
    EXECUTE format('DROP TRIGGER IF EXISTS audit_trigger ON %I', t);
    EXECUTE format(
      'CREATE TRIGGER audit_trigger AFTER INSERT OR UPDATE OR DELETE ON %I ' ||
      'FOR EACH ROW EXECUTE FUNCTION log_audit()', t);
  END LOOP;
END $$;

-- RLS: baca saja untuk authenticated; tulis hanya via trigger (SECURITY DEFINER).
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_log_select ON audit_log;
CREATE POLICY audit_log_select ON audit_log FOR SELECT TO authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON audit_log FROM authenticated;
GRANT SELECT ON audit_log TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq TO authenticated;
