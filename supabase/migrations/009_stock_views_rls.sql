-- Phase 5b: stock views enforce the caller's RLS instead of bypassing it,
-- with explicit grants (no reliance on 003-vs-005 run order).
-- Run once in Supabase SQL Editor. Re-runnable.

ALTER VIEW v_stok_produk SET (security_invoker = true);
ALTER VIEW v_stok_bahan SET (security_invoker = true);

GRANT SELECT ON v_stok_produk, v_stok_bahan TO authenticated;
REVOKE ALL ON v_stok_produk, v_stok_bahan FROM anon;

-- Seed helper is DBA-only: callable via service_role, never via anon.
REVOKE ALL ON FUNCTION reset_kode_sequences() FROM PUBLIC, anon;
