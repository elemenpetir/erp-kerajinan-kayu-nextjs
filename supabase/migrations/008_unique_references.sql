-- Phase 6b: business references must be unique per table.
-- Partial index: NULL and '' may repeat; real values must not.
-- Precondition verified: no existing duplicates (bahan, produk, bom).
-- Run once in Supabase SQL Editor, after 007. Re-runnable.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_bahan_internal_referensi') THEN
    CREATE UNIQUE INDEX uq_bahan_internal_referensi ON bahan (internal_referensi)
      WHERE internal_referensi IS NOT NULL AND internal_referensi <> '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_produk_internal_referensi') THEN
    CREATE UNIQUE INDEX uq_produk_internal_referensi ON produk (internal_referensi)
      WHERE internal_referensi IS NOT NULL AND internal_referensi <> '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'uq_bom_internal_referensi') THEN
    CREATE UNIQUE INDEX uq_bom_internal_referensi ON bom (internal_referensi)
      WHERE internal_referensi IS NOT NULL AND internal_referensi <> '';
  END IF;
END $$;
