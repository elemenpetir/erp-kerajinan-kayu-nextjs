import { PAGE_SIZE, rangeOf, cleanQ } from './pagination';

export { PAGE_SIZE };

export async function getVendorsPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('vendor_individual')
    .select('id,kode,nama,nama_perusahaan,telp,email,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.or(`nama.ilike.%${needle}%,nama_perusahaan.ilike.%${needle}%,email.ilike.%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getBillsPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('bills')
    .select('id,kode,referensi_vendor,deadline_order,total_biaya,status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.ilike('referensi_vendor', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}
