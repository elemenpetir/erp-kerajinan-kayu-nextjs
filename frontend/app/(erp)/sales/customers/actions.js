'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/sales/customers';

export async function deleteCustomer(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('customer_individual').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function updateCustomer(id, fields) {
  const nama = String(fields.nama || '').trim();
  if (!nama) throw new Error('Nama wajib diisi.');
  const supabase = await createClient();
  const { error } = await supabase
    .from('customer_individual')
    .update({
      nama,
      nama_perusahaan: String(fields.nama_perusahaan || '').trim() || null,
      alamat: String(fields.alamat || '').trim() || null,
      telp: String(fields.telp || '').trim() || null,
      email: String(fields.email || '').trim() || null,
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
