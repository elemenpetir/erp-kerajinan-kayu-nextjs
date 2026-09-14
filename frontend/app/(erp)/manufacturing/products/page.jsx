import { createClient } from '../../../../lib/supabase/server';
import { getProductsPage, getProductStockMap, getProductBomMap, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

function stokStyle(stok) {
  if (stok === undefined) return { value: 0, style: { color: '#64748b' } };
  if (stok <= 0) return { value: stok, style: { color: '#dc2626', fontWeight: '600' } };
  if (stok <= 5) return { value: stok, style: { color: '#d97706', fontWeight: '600' } };
  return { value: stok, style: { color: '#16a34a', fontWeight: '600' } };
}

export default async function ProductsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getProductsPage(supabase, { page });
  const ids = items.map((p) => p.id);
  const [stokMap, bomMap] = await Promise.all([
    getProductStockMap(supabase, ids),
    getProductBomMap(supabase, ids),
  ]);

  return (
    <div>
      <h2>Manufaktur — Produk</h2>
      <p>
        <a className="btn" href="/manufacturing/products/new">
          Buat Produk
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Harga Produksi</th>
            <th>Biaya Produksi</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const { value, style } = stokStyle(stokMap[p.id]);
            return (
              <tr key={p.id}>
                <td>{shortId('PRD', p.id)}</td>
                <td>{p.nama}</td>
                <td>{(p.harga_produksi || 0).toLocaleString('id-ID')}</td>
                <td>{(bomMap[p.id] || 0).toLocaleString('id-ID')}</td>
                <td style={style}>{value}</td>
                <td>
                  <div className="action-buttons">
                      <a href={`/manufacturing/products/${p.id}`}>Lihat / Edit</a>
                  </div>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada produk
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Buat Produk" untuk menambahkan produk pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/products" />
    </div>
  );
}
