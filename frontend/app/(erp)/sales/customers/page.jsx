import { createClient } from '../../../../lib/supabase/server';
import { getCustomersPage, PAGE_SIZE } from '../../../../lib/services/sales';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteCustomer } from './actions';

export const dynamic = 'force-dynamic';

export default async function CustomersList({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getCustomersPage(supabase, { page });

  return (
    <div>
      <h2>Customers</h2>
      <p>
        <a className="btn" href="/sales/customers/new">
          Tambah Customer
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
          {items.map((c) => (
            <tr key={c.id}>
              <td>{shortId('CUST', c.id)}</td>
              <td>{c.nama}</td>
              <td>{c.nama_perusahaan}</td>
              <td>{c.telp}</td>
              <td>{c.email}</td>
              <td>
                <div className="action-buttons">
                  <a className="btn-table-action" href={`/sales/customers/${c.id}`}>
                    Lihat
                  </a>
                  <ActionButton
                    run={deleteCustomer.bind(null, c.id)}
                    confirmText="Hapus customer ini?"
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada customer
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Tambah Customer" untuk mendaftarkan customer pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/customers" />
    </div>
  );
}
