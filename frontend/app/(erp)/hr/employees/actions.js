'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/hr/employees';

export async function deleteEmployee(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('karyawan').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function updateEmployee(id, fields) {
  const nama = String(fields.nama || '').trim();
  if (!nama) throw new Error('Nama wajib diisi.');
  const supabase = await createClient();
  const { error } = await supabase
    .from('karyawan')
    .update({
      nama,
      posisi: String(fields.posisi || '').trim() || null,
      telp: String(fields.telp || '').trim() || null,
      email: String(fields.email || '').trim() || null,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
