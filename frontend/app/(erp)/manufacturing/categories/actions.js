'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/manufacturing/categories';

export async function createCategory(formData) {
  const nama = String(formData.get('nama') || '').trim();
  if (!nama) throw new Error('Nama kategori wajib diisi');
  const supabase = await createClient();
  const { error } = await supabase.from('kategori').insert([{ nama }]);
  if (error) {
    if (error.code === '23505') throw new Error('Kategori sudah ada');
    throw new Error(error.message);
  }
  revalidatePath(PATH);
}

export async function deleteCategory(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('kategori').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
