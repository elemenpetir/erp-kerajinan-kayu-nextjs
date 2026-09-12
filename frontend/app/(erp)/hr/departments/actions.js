'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/hr/departments';

export async function createDepartment(formData) {
  const nama_departemen = String(formData.get('nama_departemen') || '').trim();
  const manager = String(formData.get('manager') || '').trim() || null;
  if (!nama_departemen) throw new Error('Nama departemen wajib diisi');
  const supabase = await createClient();
  const { error } = await supabase.from('departemen').insert([{ nama_departemen, manager }]);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function updateDepartmentManager(id, manager) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('departemen')
    .update({ manager: manager || null })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function deleteDepartment(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('departemen').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
