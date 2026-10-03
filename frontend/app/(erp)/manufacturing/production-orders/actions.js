'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/manufacturing/production-orders';

const FLOW = ['Draft', 'Konfirmasi', 'Dalam Proses', 'Selesai'];

export async function deleteProductionOrder(id) {
  const supabase = await createClient();
  const { data } = await supabase.from('order_produksi').select('status').eq('id', id).single();
  if (!data) throw new Error('Order tidak ditemukan');
  if (data.status !== 'Draft') throw new Error('Hanya order Draft yang bisa dihapus');
  const { error } = await supabase.from('order_produksi').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}

// Batalkan order Draft/Konfirmasi/Dalam Proses. Selesai tidak bisa dibatalkan
// (stok sudah masuk — reversal butuh batch tersendiri). Order Batal kekal sebagai arsip.
export async function cancelProductionOrder(id, fromStatus) {
  if (!['Draft', 'Konfirmasi', 'Dalam Proses'].includes(fromStatus)) {
    throw new Error('Hanya order Draft, Konfirmasi, atau Dalam Proses yang bisa dibatalkan');
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_produksi')
    .update({ status: 'Batal' })
    .eq('id', id)
    .eq('status', fromStatus)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Status sudah berubah, muat ulang halaman');
  revalidatePath(PATH);
}

// Optimistic concurrency: advance exactly one step from `fromStatus`.
// Concurrent tabs/cliks affecting 0 rows get a clear error instead of skipping states.
export async function advanceProductionOrder(id, fromStatus) {
  const idx = FLOW.indexOf(fromStatus);
  if (idx < 0 || idx >= FLOW.length - 1) throw new Error('Status tidak bisa dimajukan');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_produksi')
    .update({ status: FLOW[idx + 1] })
    .eq('id', id)
    .eq('status', fromStatus)
    .select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Status sudah berubah, muat ulang halaman');
  revalidatePath(PATH);
}
