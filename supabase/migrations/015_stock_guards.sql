-- 015_stock_guards.sql — tolak mutasi yang bikin stok negatif.
-- Dijalankan manual sekali via Supabase SQL Editor (seperti 002-014).
-- confirm_quotation: cek stok produk tiap item SEBELUM sales order dibuat.
-- (Bahan dicek di action advanceProductionOrder; seed tak tersentuh keduanya.)

CREATE OR REPLACE FUNCTION confirm_quotation(p_q_id uuid)
RETURNS uuid AS $$
DECLARE
  v_q quotation%ROWTYPE;
  v_so_id uuid;
  elem jsonb;
  v_pid uuid;
  v_need numeric;
  v_stock bigint;
  v_nama text;
BEGIN
  IF app_role() = 'manager' THEN RAISE EXCEPTION 'Akses ditolak (read-only)'; END IF;
  SELECT * INTO v_q FROM quotation WHERE id = p_q_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quotation tidak ditemukan'; END IF;

  SELECT id INTO v_so_id FROM sales_order WHERE quotation_id = p_q_id LIMIT 1;
  IF FOUND THEN RETURN v_so_id; END IF;
  IF v_q.status <> 'Quotation' THEN RAISE EXCEPTION 'Quotation sudah diproses'; END IF;

  FOR elem IN SELECT * FROM jsonb_array_elements(COALESCE(v_q.items, '[]'::jsonb)) LOOP
    IF elem ->> 'produk_id' ~ '^[0-9a-fA-F-]{36}$' THEN
      v_pid := (elem ->> 'produk_id')::uuid;
      v_need := COALESCE((elem ->> 'jumlah')::numeric, 0);
      SELECT nama INTO v_nama FROM produk WHERE id = v_pid;
      SELECT stok INTO v_stock FROM v_stok_produk WHERE produk_id = v_pid;
      IF v_stock IS NULL THEN v_stock := 0; END IF;
      IF v_stock < v_need THEN
        RAISE EXCEPTION 'Stok % tidak cukup (sisa %, butuh %)', COALESCE(v_nama, 'produk'), v_stock, v_need;
      END IF;
    END IF;
  END LOOP;

  UPDATE quotation SET status = 'Sales Order', updated_at = now() WHERE id = p_q_id;
  INSERT INTO sales_order (quotation_id, customer_id, customer_snapshot, expiration,
                           payment_terms, items, total_biaya, status, status_delivery)
  VALUES (p_q_id, v_q.customer_id, v_q.customer_snapshot, v_q.expiration,
          v_q.payment_terms, v_q.items, v_q.total_biaya, 'To Invoice', 'Sedang Dikirim')
  RETURNING id INTO v_so_id;
  RETURN v_so_id;
END;
$$ LANGUAGE plpgsql;

-- Pertahankan atribut keamanan seperti 005/013 (OR REPLACE tak selalu mewarisinya).
ALTER FUNCTION confirm_quotation(uuid) SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION confirm_quotation(uuid) TO authenticated;
