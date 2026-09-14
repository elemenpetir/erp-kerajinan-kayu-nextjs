'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/purchase/bills';

export async function deleteBill(id) {
  const supabase = await createClient();
  const { data } = await supabase.from('bills').select('status').eq('id', id).single();
  if (!data) throw new Error('Bill tidak ditemukan');
  if (data.status !== 'Draft Bill') throw new Error('Hanya Draft Bill yang bisa dihapus');
  const { error } = await supabase.from('bills').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function confirmBill(id) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('bills')
    .update({ status: 'Bill' })
    .eq('id', id)
    .eq('status', 'Draft Bill');
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function payBill(id) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('pay_bill', { p_bill_id: id });
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
