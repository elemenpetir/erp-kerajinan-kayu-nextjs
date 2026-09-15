'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/sales/sales-orders';

export async function createInvoice(id) {
  const supabase = await createClient();
  const { error } = await supabase.rpc('invoice_sales_order', { p_so_id: id });
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

export async function markDelivered(id) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sales_order')
    .update({ status_delivery: 'Terkirim' })
    .eq('id', id)
    .eq('status_delivery', 'Sedang Dikirim')
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Sudah Terkirim atau order tidak ditemukan');
  revalidatePath(PATH);
}
