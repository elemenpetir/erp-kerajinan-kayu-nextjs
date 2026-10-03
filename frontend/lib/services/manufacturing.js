import { PAGE_SIZE, rangeOf, cleanQ } from './pagination';

export { PAGE_SIZE };

export async function getCategoriesPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('kategori')
    .select('id,nama,created_at', { count: 'exact' })
    .order('nama', { ascending: true });
  const needle = cleanQ(q);
  if (needle) query = query.ilike('nama', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getProductionOrdersPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const needle = cleanQ(q);
  let query = supabase
    .from('order_produksi')
    .select(`id,kode,jumlah_produk,status,created_at,produk:produk_id${needle ? '!inner' : ''}(nama)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (needle) query = query.ilike('produk.nama', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getProductsPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('produk')
    .select('id,kode,nama,harga_produksi,gambar_url,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.ilike('nama', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getBomsPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const needle = cleanQ(q);
  let query = supabase
    .from('bom')
    .select(`id,kode,produk_id,total_biaya_produk,total_biaya_bahan,created_at,produk:produk_id${needle ? '!inner' : ''}(nama)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  if (needle) query = query.ilike('produk.nama', `%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getMaterialsPage(supabase, { page = 1, pageSize = PAGE_SIZE, q = '' } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  let query = supabase
    .from('bahan')
    .select('id,kode,nama,biaya,harga,internal_referensi,gambar_url,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });
  const needle = cleanQ(q);
  if (needle) query = query.or(`nama.ilike.%${needle}%,internal_referensi.ilike.%${needle}%`);
  const { data, count, error } = await query.range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

// Stok dari VIEW Postgres (003_stock_views.sql): 1 query bounded per halaman.
// ponytail: O(page) transfer, bukan O(table)
export async function getProductStockMap(supabase, produkIds) {
  if (!produkIds.length) return {};
  const { data, error } = await supabase
    .from('v_stok_produk')
    .select('produk_id,stok')
    .in('produk_id', produkIds);
  if (error) throw new Error(error.message);
  const stok = {};
  (data || []).forEach((r) => {
    stok[r.produk_id] = Number(r.stok || 0);
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
  const { data, error } = await supabase
    .from('v_stok_bahan')
    .select('bahan_id,stok')
    .in('bahan_id', bahanIds);
  if (error) throw new Error(error.message);
  const stok = {};
  (data || []).forEach((r) => {
    stok[r.bahan_id] = Number(r.stok || 0);
  });
  return stok;
}

// Laporan stok: tab (produk/bahan) + filter status kritis + q, tanpa paginasi.
export async function getStockReport(supabase, { tab = 'produk', status = 'semua', q = '' } = {}) {
  const t = tab === 'bahan' ? 'bahan' : 'produk';
  const s = status === 'kritis' ? 'kritis' : 'semua';

  const [{ data: produk }, { data: bahan }] = await Promise.all([
    supabase.from('produk').select('id,kode,nama').order('nama'),
    supabase.from('bahan').select('id,kode,nama').order('nama'),
  ]);
  const produkList = produk || [];
  const bahanList = bahan || [];
  const [stokP, stokB] = await Promise.all([
    getProductStockMap(supabase, produkList.map((p) => p.id)),
    getMaterialStockMap(supabase, bahanList.map((b) => b.id)),
  ]);
  const produkRows = produkList.map((p) => ({ ...p, _stok: stokP[p.id] ?? 0 }));
  const bahanRows = bahanList.map((b) => ({ ...b, _stok: stokB[b.id] ?? 0 }));

  const ambang = t === 'produk' ? 5 : 10;
  const rows = (t === 'produk' ? produkRows : bahanRows)
    .filter((r) => (s === 'kritis' ? r._stok <= ambang : true))
    .filter((r) => (q ? r.nama.toLowerCase().includes(q.toLowerCase()) : true));

  return {
    items: rows,
    count: rows.length,
    produkCount: produkRows.length,
    bahanCount: bahanRows.length,
    kritis: [...produkRows.filter((r) => r._stok <= 5), ...bahanRows.filter((r) => r._stok <= 10)].length,
  };
}
