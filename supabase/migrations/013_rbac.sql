-- 013_rbac.sql — RBAC 3 role: admin (penuh) / manager (read-only) / staff (operasional).
-- Role dibaca dari JWT app_metadata (hanya bisa diubah via Admin API / SQL — JANGAN user_metadata).
-- Dijalankan manual sekali via Supabase SQL Editor (seperti 002-012).

-- 1. Helper role: default 'staff' bila tanpa claim; service_role dianggap admin.
CREATE OR REPLACE FUNCTION current_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN coalesce(auth.jwt()->>'role', '') = 'service_role' THEN 'admin'
    ELSE coalesce(auth.jwt()->'app_metadata'->>'role', 'staff')
  END;
$$;

-- 2. Ganti policy permisif 005 dengan matriks RBAC (daftar tabel sama seperti 005).
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
    EXECUTE format('DROP POLICY IF EXISTS authenticated_all ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS rbac_select ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS rbac_insert ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS rbac_update ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS rbac_delete_admin ON %I', t);
    EXECUTE format('DROP POLICY IF EXISTS rbac_delete_staff ON %I', t);

    -- SELECT: semua role, kecuali 2 tabel finansial (admin + manager saja).
    IF t IN ('customer_invoice', 'vendor_bill') THEN
      EXECUTE format(
        'CREATE POLICY rbac_select ON %I FOR SELECT TO authenticated ' ||
        'USING (current_role() IN (''admin'', ''manager''))', t);
    ELSE
      EXECUTE format(
        'CREATE POLICY rbac_select ON %I FOR SELECT TO authenticated USING (true)', t);
    END IF;

    -- INSERT + UPDATE: admin + staff, kecuali 4 tabel finansial (admin saja; ditulis via RPC).
    IF t IN ('customer_invoice', 'vendor_bill', 'pembayaran_bill', 'pembayaran_sales_order') THEN
      EXECUTE format(
        'CREATE POLICY rbac_insert ON %I FOR INSERT TO authenticated ' ||
        'WITH CHECK (current_role() = ''admin'')', t);
      EXECUTE format(
        'CREATE POLICY rbac_update ON %I FOR UPDATE TO authenticated ' ||
        'USING (current_role() = ''admin'') WITH CHECK (current_role() = ''admin'')', t);
    ELSE
      EXECUTE format(
        'CREATE POLICY rbac_insert ON %I FOR INSERT TO authenticated ' ||
        'WITH CHECK (current_role() IN (''admin'', ''staff''))', t);
      EXECUTE format(
        'CREATE POLICY rbac_update ON %I FOR UPDATE TO authenticated ' ||
        'USING (current_role() IN (''admin'', ''staff'')) ' ||
        'WITH CHECK (current_role() IN (''admin'', ''staff''))', t);
    END IF;

    -- DELETE: admin di semua tabel; staff hanya operasional non-master.
    EXECUTE format(
      'CREATE POLICY rbac_delete_admin ON %I FOR DELETE TO authenticated ' ||
      'USING (current_role() = ''admin'')', t);
    IF t IN ('produk','bahan','bom','order_produksi','bills','quotation','sales_order') THEN
      EXECUTE format(
        'CREATE POLICY rbac_delete_staff ON %I FOR DELETE TO authenticated ' ||
        'USING (current_role() = ''staff'')', t);
    END IF;
  END LOOP;
END $$;

-- 3. Guard role di 3 RPC (SECURITY DEFINER bypass RLS — tanpa ini manager tetap bisa mutasi via RPC langsung).
CREATE OR REPLACE FUNCTION pay_bill(p_bill_id uuid)
RETURNS void AS $$
DECLARE
  v_total numeric;
  v_status text;
BEGIN
  IF current_role() = 'manager' THEN RAISE EXCEPTION 'Akses ditolak (read-only)'; END IF;
  SELECT total_biaya, status INTO v_total, v_status
  FROM bills WHERE id = p_bill_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bill tidak ditemukan'; END IF;
  IF v_status <> 'Bill' THEN RAISE EXCEPTION 'Hanya bill berstatus Bill yang bisa dibayar'; END IF;

  UPDATE bills SET status = 'Paid', updated_at = now() WHERE id = p_bill_id;
  INSERT INTO vendor_bill (bill_id, jumlah_pembayaran, payment_date)
  VALUES (p_bill_id, v_total, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION invoice_sales_order(p_so_id uuid)
RETURNS void AS $$
DECLARE
  v_total numeric;
  v_status text;
BEGIN
  IF current_role() = 'manager' THEN RAISE EXCEPTION 'Akses ditolak (read-only)'; END IF;
  SELECT total_biaya, status INTO v_total, v_status
  FROM sales_order WHERE id = p_so_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sales Order tidak ditemukan'; END IF;
  IF v_status <> 'To Invoice' THEN RAISE EXCEPTION 'Hanya order To Invoice yang bisa di-invoice'; END IF;

  UPDATE sales_order SET status = 'Fully Invoice', updated_at = now() WHERE id = p_so_id;
  INSERT INTO customer_invoice (sales_order_id, jumlah_pembayaran, payment_date)
  VALUES (p_so_id, v_total, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION confirm_quotation(p_q_id uuid)
RETURNS uuid AS $$
DECLARE
  v_q quotation%ROWTYPE;
  v_so_id uuid;
BEGIN
  IF current_role() = 'manager' THEN RAISE EXCEPTION 'Akses ditolak (read-only)'; END IF;
  SELECT * INTO v_q FROM quotation WHERE id = p_q_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quotation tidak ditemukan'; END IF;

  SELECT id INTO v_so_id FROM sales_order WHERE quotation_id = p_q_id LIMIT 1;
  IF FOUND THEN RETURN v_so_id; END IF;
  IF v_q.status <> 'Quotation' THEN RAISE EXCEPTION 'Quotation sudah diproses'; END IF;

  UPDATE quotation SET status = 'Sales Order', updated_at = now() WHERE id = p_q_id;
  INSERT INTO sales_order (quotation_id, customer_id, customer_snapshot, expiration,
                           payment_terms, items, total_biaya, status, status_delivery)
  VALUES (p_q_id, v_q.customer_id, v_q.customer_snapshot, v_q.expiration,
          v_q.payment_terms, v_q.items, v_q.total_biaya, 'To Invoice', 'Sedang Dikirim')
  RETURNING id INTO v_so_id;
  RETURN v_so_id;
END;
$$ LANGUAGE plpgsql;

-- Pertahankan atribut keamanan RPC seperti 005 (CREATE OR REPLACE tidak selalu mewarisinya).
ALTER FUNCTION pay_bill(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION invoice_sales_order(uuid) SECURITY DEFINER SET search_path = public;
ALTER FUNCTION confirm_quotation(uuid) SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION pay_bill(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION invoice_sales_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_quotation(uuid) TO authenticated;

-- 4. Storage: tolak manager tulis gambar (baca publik tetap seperti 011).
DROP POLICY IF EXISTS "auth_write_produk_images" ON storage.objects;
CREATE POLICY "auth_write_produk_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'produk-images'
    AND (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'manager');

DROP POLICY IF EXISTS "auth_update_produk_images" ON storage.objects;
CREATE POLICY "auth_update_produk_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'produk-images'
    AND (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'manager');

DROP POLICY IF EXISTS "auth_delete_produk_images" ON storage.objects;
CREATE POLICY "auth_delete_produk_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'produk-images'
    AND (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'manager');

DROP POLICY IF EXISTS "auth_write_bahan_images" ON storage.objects;
CREATE POLICY "auth_write_bahan_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bahan-images'
    AND (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'manager');

DROP POLICY IF EXISTS "auth_update_bahan_images" ON storage.objects;
CREATE POLICY "auth_update_bahan_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bahan-images'
    AND (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'manager');

DROP POLICY IF EXISTS "auth_delete_bahan_images" ON storage.objects;
CREATE POLICY "auth_delete_bahan_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bahan-images'
    AND (auth.jwt()->'app_metadata'->>'role') IS DISTINCT FROM 'manager');

-- 5. Set role demo user (sesuaikan email bila berbeda):
-- UPDATE auth.users SET raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'
-- WHERE email = 'demo@erp.example';
