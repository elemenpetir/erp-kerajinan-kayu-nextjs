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

// Batalkan SO yang masih To Invoice dan belum Terkirim. Invoice + Fully Invoice
// selalu ko-atomik via RPC sehingga To Invoice berarti belum ada pembayaran.
export async function cancelSalesOrder(id, fromStatus, deliveryStatus) {
  if (fromStatus !== 'To Invoice') {
    throw new Error('Hanya order To Invoice yang bisa dibatalkan');
  }
  if (deliveryStatus === 'Terkirim') {
    throw new Error('Order yang sudah Terkirim tidak bisa dibatalkan (gunakan alur retur)');
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sales_order')
    .update({ status: 'Batal' })
    .eq('id', id)
    .eq('status', 'To Invoice')
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Status sudah berubah, muat ulang halaman');
  revalidatePath(PATH);
}
