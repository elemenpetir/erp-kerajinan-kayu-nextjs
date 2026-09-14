-- Phase 2: stock views — 1 row per produk/bahan, computed in Postgres.
-- Frontend queries with .in(id, [...pageIds]) → O(page), not O(table).
-- Run once in Supabase SQL Editor.

CREATE OR REPLACE VIEW v_stok_produk AS
WITH masuk AS (
  SELECT produk_id, COALESCE(SUM(jumlah_produk), 0)::bigint AS jml
  FROM order_produksi
  WHERE status = 'Selesai' AND produk_id IS NOT NULL
  GROUP BY produk_id
),
keluar AS (
  SELECT (elem ->> 'produk_id')::uuid AS produk_id,
         COALESCE(SUM((elem ->> 'jumlah')::numeric), 0)::bigint AS jml
  FROM sales_order,
       LATERAL jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS elem
  WHERE status IN ('To Invoice', 'Fully Invoice')
    AND elem ->> 'produk_id' ~ '^[0-9a-fA-F-]{36}$'
  GROUP BY 1
),
semua AS (
  SELECT produk_id FROM masuk
  UNION
  SELECT produk_id FROM keluar
)
SELECT s.produk_id,
       COALESCE(m.jml, 0) - COALESCE(k.jml, 0) AS stok
FROM semua s
LEFT JOIN masuk m USING (produk_id)
LEFT JOIN keluar k USING (produk_id);

CREATE OR REPLACE VIEW v_stok_bahan AS
WITH masuk AS (
  SELECT (elem ->> 'bahan_id')::uuid AS bahan_id,
         COALESCE(SUM((elem ->> 'jumlah')::numeric), 0)::bigint AS jml
  FROM bills,
       LATERAL jsonb_array_elements(COALESCE(items, '[]'::jsonb)) AS elem
  WHERE status = 'Paid'
    AND elem ->> 'bahan_id' ~ '^[0-9a-fA-F-]{36}$'
  GROUP BY 1
),
keluar AS (
  SELECT (elem ->> 'bahan_id')::uuid AS bahan_id,
         COALESCE(SUM((elem ->> 'jumlah')::numeric * COALESCE(jumlah_produk, 1)), 0)::bigint AS jml
  FROM order_produksi,
       LATERAL jsonb_array_elements(COALESCE(components, '[]'::jsonb)) AS elem
  WHERE status IN ('Dalam Proses', 'Selesai')
    AND elem ->> 'bahan_id' ~ '^[0-9a-fA-F-]{36}$'
  GROUP BY 1
),
semua AS (
  SELECT bahan_id FROM masuk
  UNION
  SELECT bahan_id FROM keluar
)
SELECT s.bahan_id,
       COALESCE(m.jml, 0) - COALESCE(k.jml, 0) AS stok
FROM semua s
LEFT JOIN masuk m USING (bahan_id)
LEFT JOIN keluar k USING (bahan_id);
