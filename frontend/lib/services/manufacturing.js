import { PAGE_SIZE, rangeOf } from './pagination';

export { PAGE_SIZE };

export async function getCategoriesPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('kategori')
    .select('id,nama,created_at', { count: 'exact' })
    .order('nama', { ascending: true })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getProductionOrdersPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('order_produksi')
    .select('id,jumlah_produk,status,created_at,produk:produk_id(nama)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}
