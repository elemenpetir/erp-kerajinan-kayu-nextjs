import { createClient } from '../../../lib/supabase/server';
import { getBillsPage, PAGE_SIZE } from '../../../lib/services/purchase';
import { shortId } from '../../../lib/utils/format';
import Pagination from '../../../components/ui/Pagination';
import ActionButton from '../../../components/ui/ActionButton';
import { deleteBill, confirmBill, payBill } from './actions';

export const dynamic = 'force-dynamic';

export default async function BillsList({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getBillsPage(supabase, { page });

  return (
    <div>
      <h2>Purchase - Bills</h2>
      <p>
        <a className="btn" href="/purchase/bills/create">
          Buat Bill
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Referensi Vendor</th>
            <th>Deadline</th>
            <th>Total</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{shortId('BILL', b.id)}</td>
              <td>{b.referensi_vendor}</td>
              <td>{b.deadline_order}</td>
              <td>{b.total_biaya}</td>
              <td>{b.status}</td>
              <td>
                <div className="action-buttons">
                  <a className="btn-table-action" href={`/purchase/bills/${b.id}`}>
                    Lihat
                  </a>
                  {b.status === 'Bill' && (
                    <ActionButton
                      run={payBill.bind(null, b.id)}
                      confirmText="Bayar bill ini? Data akan masuk ke Vendor Bill Accounting."
                      successText="Bill berhasil dibayar!"
                      label="Bayar"
                      className="btn-table-action"
                    />
                  )}
                  {b.status === 'Draft Bill' && (
                    <ActionButton
                      run={confirmBill.bind(null, b.id)}
                      confirmText="Konfirmasi bill ini?"
                      label="Konfirmasi"
                      className="btn-table-action"
                    />
                  )}
                  {b.status === 'Draft Bill' && (
                    <ActionButton
                      run={deleteBill.bind(null, b.id)}
                      confirmText="Hapus bill ini?"
                      label="Hapus"
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada tagihan
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Buat Bill" untuk mencatat tagihan pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/purchase/bills" />
    </div>
  );
}
