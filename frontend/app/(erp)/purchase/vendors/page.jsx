import { createClient } from '../../../../lib/supabase/server';
import { getVendorsPage, PAGE_SIZE } from '../../../../lib/services/purchase';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteVendor } from './actions';

export const dynamic = 'force-dynamic';

export default async function VendorsList({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getVendorsPage(supabase, { page });

  return (
    <div>
      <h2>Vendors</h2>
      <p>
        <a className="btn" href="/purchase/vendors/new">
          Tambah Vendor
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Perusahaan</th>
            <th>Telp</th>
            <th>Email</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((v) => (
            <tr key={v.id}>
              <td>{shortId('VND', v.id)}</td>
              <td>{v.nama}</td>
              <td>{v.nama_perusahaan}</td>
              <td>{v.telp}</td>
              <td>{v.email}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/purchase/vendors/${v.id}`}>Lihat</a>
                  <ActionButton
                    run={deleteVendor.bind(null, v.id)}
                    confirmText={`Hapus vendor "${v.nama}"?`}
                    label="Hapus"
                    className="btn-danger"
                  />
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada vendor
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Tambah Vendor" untuk mendaftarkan vendor pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/purchase/vendors" />
    </div>
  );
}
