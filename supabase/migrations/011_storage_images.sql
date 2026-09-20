-- 011: Storage publik untuk foto produk & bahan.
-- Tabel hanya menyimpan gambar_url; file fisik di bucket ini.
-- Jalankan di Supabase SQL Editor (seperti 006-010).

INSERT INTO storage.buckets (id, name, public)
VALUES ('produk-images', 'produk-images', true),
       ('bahan-images', 'bahan-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Read publik (tanpa login) untuk kedua bucket.
DROP POLICY IF EXISTS "public_read_produk_images" ON storage.objects;
CREATE POLICY "public_read_produk_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'produk-images');

DROP POLICY IF EXISTS "public_read_bahan_images" ON storage.objects;
CREATE POLICY "public_read_bahan_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bahan-images');

-- Write hanya untuk user login (invite-only, sama seperti RLS tabel).
DROP POLICY IF EXISTS "auth_write_produk_images" ON storage.objects;
CREATE POLICY "auth_write_produk_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'produk-images');

DROP POLICY IF EXISTS "auth_update_produk_images" ON storage.objects;
CREATE POLICY "auth_update_produk_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'produk-images');

DROP POLICY IF EXISTS "auth_delete_produk_images" ON storage.objects;
CREATE POLICY "auth_delete_produk_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'produk-images');

DROP POLICY IF EXISTS "auth_write_bahan_images" ON storage.objects;
CREATE POLICY "auth_write_bahan_images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bahan-images');

DROP POLICY IF EXISTS "auth_update_bahan_images" ON storage.objects;
CREATE POLICY "auth_update_bahan_images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'bahan-images');

DROP POLICY IF EXISTS "auth_delete_bahan_images" ON storage.objects;
CREATE POLICY "auth_delete_bahan_images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'bahan-images');
