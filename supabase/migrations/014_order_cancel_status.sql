-- 014_order_cancel_status.sql — izinkan status 'Batal' di order_produksi (cancel flow).
-- Dijalankan manual sekali via Supabase SQL Editor (seperti 002-013).
-- Nama constraint CHECK bawaan 001 tidak eksplisit sehingga dicari dinamis.

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'order_produksi'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE order_produksi DROP CONSTRAINT %I', c.conname);
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_produksi_status_check') THEN
    ALTER TABLE order_produksi ADD CONSTRAINT order_produksi_status_check
      CHECK (status IN ('Draft', 'Konfirmasi', 'Dalam Proses', 'Selesai', 'Batal'));
  END IF;
END $$;
