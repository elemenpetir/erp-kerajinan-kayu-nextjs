import { PAGE_SIZE, rangeOf, cleanQ } from './pagination';

export { PAGE_SIZE };

export async function getCustomersPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('customer_individual')
    .select('id,kode,nama,nama_perusahaan,telp,email,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.or(`nama.ilike.%${needle}%,nama_perusahaan.ilike.%${needle}%,email.ilike.%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getQuotationsPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('quotation')
    .select('id,kode,customer_snapshot,payment_terms,total_biaya,status,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.ilike('customer_snapshot->>nama', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getSalesOrdersPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('sales_order')
    .select('id,kode,customer_snapshot,payment_terms,total_biaya,status,status_delivery,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.ilike('customer_snapshot->>nama', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

// Laporan penjualan: filter periode + q customer, tanpa paginasi.
export async function getSalesReport(supabase, { from = '', to = '', q = '' } = {}) {
  let query = supabase
    .from('sales_order')
    .select('id,kode,customer_snapshot,total_biaya,status,created_at')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', `${to}T23:59:59`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data || []).filter((o) =>
    q ? String(o.customer_snapshot?.nama || '').toLowerCase().includes(q.toLowerCase()) : true,
  );
  return { rows };
}
