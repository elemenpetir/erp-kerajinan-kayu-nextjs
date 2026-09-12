'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/sales/sales-orders';

export async function createInvoice(id) {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from('sales_order')
    .select('id,total_biaya,status')
    .eq('id', id)
    .single();
  if (!order) throw new Error('Sales Order tidak ditemukan');
  if (order.status !== 'To Invoice') throw new Error('Hanya order To Invoice yang bisa di-invoice');

  const today = new Date().toISOString().split('T')[0];
  const { error: updateError } = await supabase
    .from('sales_order')
    .update({ status: 'Fully Invoice' })
    .eq('id', id)
    .eq('status', 'To Invoice');
  if (updateError) throw new Error(updateError.message);

  const { error: insertError } = await supabase.from('customer_invoice').insert([
    { sales_order_id: id, jumlah_pembayaran: order.total_biaya, payment_date: today },
  ]);
  if (insertError) throw new Error(insertError.message);
  revalidatePath(PATH);
}
