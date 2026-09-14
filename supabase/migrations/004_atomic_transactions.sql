-- Phase 3: atomic transactions. One RPC = one DB transaction with
-- row lock + status guard, so double-click / partial failure can't
-- desync status vs invoice/bill rows. Run once in Supabase SQL Editor.

-- Bayar bill: Bill → Paid + insert vendor_bill
CREATE OR REPLACE FUNCTION pay_bill(p_bill_id uuid)
RETURNS void AS $$
DECLARE
  v_total numeric;
  v_status text;
BEGIN
  SELECT total_biaya, status INTO v_total, v_status
  FROM bills WHERE id = p_bill_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bill tidak ditemukan'; END IF;
  IF v_status <> 'Bill' THEN RAISE EXCEPTION 'Hanya bill berstatus Bill yang bisa dibayar'; END IF;

  UPDATE bills SET status = 'Paid', updated_at = now() WHERE id = p_bill_id;
  INSERT INTO vendor_bill (bill_id, jumlah_pembayaran, payment_date)
  VALUES (p_bill_id, v_total, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Invoice sales order: To Invoice → Fully Invoice + insert customer_invoice
CREATE OR REPLACE FUNCTION invoice_sales_order(p_so_id uuid)
RETURNS void AS $$
DECLARE
  v_total numeric;
  v_status text;
BEGIN
  SELECT total_biaya, status INTO v_total, v_status
  FROM sales_order WHERE id = p_so_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sales Order tidak ditemukan'; END IF;
  IF v_status <> 'To Invoice' THEN RAISE EXCEPTION 'Hanya order To Invoice yang bisa di-invoice'; END IF;

  UPDATE sales_order SET status = 'Fully Invoice', updated_at = now() WHERE id = p_so_id;
  INSERT INTO customer_invoice (sales_order_id, jumlah_pembayaran, payment_date)
  VALUES (p_so_id, v_total, CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- Konfirmasi quotation → sales order (idempotent: existing SO reused)
CREATE OR REPLACE FUNCTION confirm_quotation(p_q_id uuid)
RETURNS uuid AS $$
DECLARE
  v_q quotation%ROWTYPE;
  v_so_id uuid;
BEGIN
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
