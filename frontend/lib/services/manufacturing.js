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

export async function getProductsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('produk')
    .select('id,nama,harga_produksi,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getBomsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('bom')
    .select('id,produk_id,total_biaya_produk,total_biaya_bahan,created_at,produk:produk_id(nama)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getMaterialsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('bahan')
    .select('id,nama,biaya,harga,internal_referensi,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

// Stok dihitung per ID halaman (bounded). Sales/bills items jsonb tak bisa
// difilter di query → select sempit; diganti VIEW di Phase 2.
// ponytail: O(page) transfer, bukan O(table)
export async function getProductStockMap(supabase, produkIds) {
  if (!produkIds.length) return {};
  const [{ data: orderSelesai }, { data: salesOrders }] = await Promise.all([
    supabase.from('order_produksi').select('produk_id,jumlah_produk').eq('status', 'Selesai').in('produk_id', produkIds),
    supabase.from('sales_order').select('items').in('status', ['To Invoice', 'Fully Invoice']),
  ]);
  const stok = {};
  (orderSelesai || []).forEach((o) => {
    if (!o.produk_id) return;
    stok[o.produk_id] = (stok[o.produk_id] || 0) + (o.jumlah_produk || 0);
  });
  (salesOrders || []).forEach((so) => {
    (so.items || []).forEach((item) => {
      if (!item.produk_id || !produkIds.includes(item.produk_id)) return;
      stok[item.produk_id] = (stok[item.produk_id] || 0) - (item.jumlah || 0);
    });
  });
  return stok;
}

export async function getProductBomMap(supabase, produkIds) {
  if (!produkIds.length) return {};
  const { data, error } = await supabase
    .from('bom')
    .select('produk_id,total_biaya_bahan')
    .in('produk_id', produkIds);
  if (error) return {};
  const map = {};
  (data || []).forEach((b) => {
    if (b.produk_id) map[b.produk_id] = b.total_biaya_bahan || 0;
  });
  return map;
}

export async function getMaterialStockMap(supabase, bahanIds) {
  if (!bahanIds.length) return {};
  const [{ data: billsPaid }, { data: orderSelesai }] = await Promise.all([
    supabase.from('bills').select('items').eq('status', 'Paid'),
    supabase.from('order_produksi').select('components,jumlah_produk').in('status', ['Dalam Proses', 'Selesai']),
  ]);
  const stok = {};
  (billsPaid || []).forEach((bill) => {
    (bill.items || []).forEach((item) => {
      if (!item.bahan_id || !bahanIds.includes(item.bahan_id)) return;
      stok[item.bahan_id] = (stok[item.bahan_id] || 0) + (item.jumlah || 0);
    });
  });
  (orderSelesai || []).forEach((order) => {
    const qty = order.jumlah_produk || 1;
    (order.components || []).forEach((comp) => {
      if (!comp.bahan_id || !bahanIds.includes(comp.bahan_id)) return;
      stok[comp.bahan_id] = (stok[comp.bahan_id] || 0) - (comp.jumlah || 0) * qty;
    });
  });
  return stok;
}
