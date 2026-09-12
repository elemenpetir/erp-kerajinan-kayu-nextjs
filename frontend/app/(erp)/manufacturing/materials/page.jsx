import { createClient } from '../../../../lib/supabase/server';
import { getMaterialsPage, getMaterialStockMap, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

function stokLabel(stok) {
  if (stok === undefined) return { label: '0', style: { color: '#64748b' } };
  if (stok <= 0) return { label: stok.toString(), style: { color: '#dc2626', fontWeight: '600' } };
  if (stok <= 10) return { label: stok.toString(), style: { color: '#d97706', fontWeight: '600' } };
  return { label: stok.toString(), style: { color: '#16a34a', fontWeight: '600' } };
}

export default async function MaterialsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getMaterialsPage(supabase, { page });
  const stokMap = await getMaterialStockMap(
    supabase,
    items.map((b) => b.id),
  );

  return (
    <div>
      <h2>Manufaktur — Bahan</h2>
      <p>
        <a className="btn" href="/manufaktur/bahan/create">
          Tambah Bahan
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Biaya</th>
            <th>Harga</th>
            <th>Referensi</th>
            <th>Stok</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => {
            const { label, style } = stokLabel(stokMap[b.id]);
            return (
              <tr key={b.id}>
                <td>{shortId('BHN', b.id)}</td>
                <td>{b.nama}</td>
                <td>{(b.biaya || 0).toLocaleString('id-ID')}</td>
                <td>{(b.harga || 0).toLocaleString('id-ID')}</td>
                <td>{b.internal_referensi}</td>
                <td style={style}>{label}</td>
                <td>
                  <div className="action-buttons">
                    <a href={`/manufaktur/bahan/${b.id}`}>Lihat</a>
                  </div>
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🪵</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada bahan
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Tambah Bahan" untuk menambahkan bahan baku pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/materials" />
    </div>
  );
}
