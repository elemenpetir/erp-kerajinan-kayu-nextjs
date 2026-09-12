'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/sales/quotations';

export async function deleteQuotation(id) {
  const supabase = await createClient();
  const { data } = await supabase.from('quotation').select('status').eq('id', id).single();
  if (!data) throw new Error('Quotation tidak ditemukan');
  if (data.status === 'Sales Order') throw new Error('Quotation yang sudah jadi Sales Order tidak bisa dihapus');
  const { error } = await supabase.from('quotation').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
