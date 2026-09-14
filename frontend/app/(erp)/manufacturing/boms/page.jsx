import { createClient } from '../../../../lib/supabase/server';
import { getBomsPage, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function BomsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getBomsPage(supabase, { page });

  return (
    <div>
      <h2>Manufaktur — BOM</h2>
      <p>
        <a className="btn" href="/manufacturing/boms/new">
          Tambah BOM
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Produk</th>
            <th>Total Biaya Produk</th>
            <th>Total Biaya Bahan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{shortId('BOM', b.id)}</td>
              <td>{b.produk?.nama || '-'}</td>
              <td>{b.total_biaya_produk}</td>
              <td>{b.total_biaya_bahan}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/manufacturing/boms/${b.id}`}>Lihat</a>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔩</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada Bill of Materials
                  </p>
                  <p style={{ fontSize: 14 }}>Buat BOM dari halaman detail produk.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/boms" />
    </div>
  );
}
