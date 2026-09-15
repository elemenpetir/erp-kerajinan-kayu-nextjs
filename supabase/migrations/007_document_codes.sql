-- Phase 6: document codes. kode becomes the system-owned sequential
-- number per table (displayed as PRD-0001, BHN-0001, ...).
-- Preconditions verified: kode is integer, no duplicates (bahan, produk).
-- Run once in Supabase SQL Editor. Re-runnable (all steps guarded).

-- 1. Backfill NULL kode sequentially per created_at, continuing from max.
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
      'WITH ranked AS (
         SELECT id, COALESCE(MAX(kode) OVER (), 0)
           + ROW_NUMBER() OVER (ORDER BY created_at, id) AS new_kode
         FROM %I WHERE kode IS NULL
       )
       UPDATE %I AS x SET kode = ranked.new_kode
       FROM ranked WHERE x.id = ranked.id',
      t, t);
  END LOOP;
END $$;

-- 2. One sequence per table (each restarts at 1: PRD-0001 and BHN-0001
-- are independent), wired as column default.
DO $$
DECLARE
  t text;
  seq text;
  start_val integer;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bahan','produk','bills','bom','customer_company','customer_individual',
    'departemen','karyawan','order_produksi','quotation',
    'sales_order','vendor_company','vendor_individual'
  ]
  LOOP
    seq := t || '_kode_seq';
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %I', seq);
    EXECUTE format('SELECT COALESCE(MAX(kode), 0) + 1 FROM %I', t) INTO start_val;
    -- Only move forward, never backward (re-runs after deletes stay safe).
    PERFORM setval(seq, GREATEST(start_val, COALESCE((SELECT last_value FROM pg_sequences WHERE schemaname = ''public'' AND sequencename = seq), 1)), false);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN kode SET DEFAULT nextval(%L)', t, seq);
    EXECUTE format('ALTER TABLE %I ALTER COLUMN kode SET NOT NULL', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = t || '_kode_unique' AND conrelid = t::regclass
    ) THEN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I UNIQUE (kode)', t, t || '_kode_unique');
    END IF;
  END LOOP;
END $$;

-- 3. Helper for the seed script: realign sequences after wipe & reseed
-- (deletes don't move sequences, so reseed would otherwise leave gaps).
CREATE OR REPLACE FUNCTION reset_kode_sequences()
RETURNS void AS $$
DECLARE
  t text;
  seq text;
  m integer;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bahan','produk','bills','bom','customer_company','customer_individual',
    'departemen','karyawan','order_produksi','quotation',
    'sales_order','vendor_company','vendor_individual'
  ]
  LOOP
    seq := t || '_kode_seq';
    EXECUTE format('SELECT COALESCE(MAX(kode), 0) FROM %I', t) INTO m;
    PERFORM setval(seq, GREATEST(m + 1, 1), false);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
