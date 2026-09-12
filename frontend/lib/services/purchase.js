import { PAGE_SIZE, rangeOf } from './pagination';

export { PAGE_SIZE };

export async function getVendorsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('vendor_individual')
    .select('id,nama,nama_perusahaan,telp,email,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getBillsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('bills')
    .select('id,referensi_vendor,deadline_order,total_biaya,status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}
