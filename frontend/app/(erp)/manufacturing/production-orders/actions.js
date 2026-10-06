'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';
import { getMaterialStockMap } from '../../../../lib/services/manufacturing';

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

  // Validasi stok bahan: masuk Dalam Proses mulai memakan components × jumlah.
  // Transisi lain tak menambah kurang (Selesai memakai hitungan yang sama).
  if (fromStatus === 'Konfirmasi') {
    const { data: order, error: orderError } = await supabase
      .from('order_produksi')
      .select('jumlah_produk,components')
      .eq('id', id)
      .single();
    if (orderError || !order) throw new Error(orderError?.message || 'Order tidak ditemukan');
    const comps = (order.components || []).filter((c) => c?.bahan_id);
    if (comps.length > 0) {
      const ids = comps.map((c) => c.bahan_id);
      const stokMap = await getMaterialStockMap(supabase, ids);
      const { data: bahans } = await supabase.from('bahan').select('id,nama').in('id', ids);
      const namaMap = Object.fromEntries((bahans || []).map((b) => [b.id, b.nama]));
      for (const c of comps) {
        const need = Number(c.jumlah || 0) * Number(order.jumlah_produk || 1);
        const sisa = Number(stokMap[c.bahan_id] ?? 0);
        if (sisa < need) {
          throw new Error(`Stok bahan ${namaMap[c.bahan_id] || 'tak dikenal'} tidak cukup (sisa ${sisa}, butuh ${need})`);
        }
      }
    }
  }

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
