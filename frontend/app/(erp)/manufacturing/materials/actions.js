'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/manufacturing/materials';

export async function deleteMaterial(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('bahan').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function updateMaterial(id, fields) {
  const nama = String(fields.nama || '').trim();
  if (!nama) throw new Error('Nama wajib diisi.');
  const biaya = Number(fields.biaya || 0);
  const harga = Number(fields.harga || 0);
  if (!Number.isFinite(biaya) || biaya < 0 || !Number.isFinite(harga) || harga < 0) {
    throw new Error('Biaya dan harga harus angka ≥ 0.');
  }
  const ref = String(fields.internal_referensi || '').trim() || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from('bahan')
    .update({ nama, biaya, harga, internal_referensi: ref })
    .eq('id', id);
  if (error) {
    if (error.code === '23505') throw new Error('Referensi sudah dipakai, gunakan yang lain.');
    throw new Error(error.message);
  }
  revalidatePath(PATH);
}
