import { supabase } from '@/lib/supabase/client';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

// Upload satu file gambar ke bucket Storage, return public URL.
// Validasi tipe + ukuran di sini agar semua form konsisten.
export async function uploadImage(bucket, file) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
  if (file.size > MAX_SIZE) throw new Error('Ukuran gambar maks 2MB.');
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// ponytail: file lama tidak dihapus otomatis saat foto diganti;
// bersihkan manual di dashboard Storage jika menumpuk.
