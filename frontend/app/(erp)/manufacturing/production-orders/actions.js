'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../../lib/supabase/server';

const PATH = '/manufacturing/production-orders';

export async function deleteProductionOrder(id) {
  const supabase = await createClient();
  const { data } = await supabase.from('order_produksi').select('status').eq('id', id).single();
  if (!data) throw new Error('Order tidak ditemukan');
  if (data.status !== 'Draft') throw new Error('Hanya order Draft yang bisa dihapus');
  const { error } = await supabase.from('order_produksi').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(PATH);
}
