'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../lib/supabase/server';

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
  const { data: bill } = await supabase
    .from('bills')
    .select('id,total_biaya,status')
    .eq('id', id)
    .single();
  if (!bill) throw new Error('Bill tidak ditemukan');
  if (bill.status !== 'Bill') throw new Error('Hanya bill berstatus Bill yang bisa dibayar');

  const { error: updateError } = await supabase
    .from('bills')
    .update({ status: 'Paid' })
    .eq('id', id)
    .eq('status', 'Bill');
  if (updateError) throw new Error(updateError.message);

  const { error: insertError } = await supabase.from('vendor_bill').insert([
    {
      bill_id: id,
      jumlah_pembayaran: bill.total_biaya,
      payment_date: new Date().toISOString().split('T')[0],
    },
  ]);
  if (insertError) throw new Error(insertError.message);
  revalidatePath(PATH);
}
