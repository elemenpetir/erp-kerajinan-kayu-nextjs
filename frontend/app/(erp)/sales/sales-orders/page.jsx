import { createClient } from '../../../../lib/supabase/server';
import { getSalesOrdersPage, PAGE_SIZE } from '../../../../lib/services/sales';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { createInvoice } from './actions';

export const dynamic = 'force-dynamic';

export default async function SalesOrdersPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getSalesOrdersPage(supabase, { page });

  return (
    <div>
      <h2>Sales Orders</h2>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Customer</th>
            <th>Payment Terms</th>
            <th>Total</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>{shortId('SO', o.id)}</td>
              <td>{o.customer_snapshot?.nama || '-'}</td>
              <td>{o.payment_terms || '-'}</td>
              <td>Rp {Number(o.total_biaya || 0).toLocaleString('id-ID')}</td>
              <td>{o.status}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/sales/orders/${o.id}`}>Lihat</a>
                  {o.status === 'To Invoice' && (
                    <ActionButton
                      run={createInvoice.bind(null, o.id)}
                      confirmText="Buat invoice untuk Sales Order ini?"
                      successText="Invoice berhasil dibuat."
                      label="Buat Invoice"
                      className="btn-danger"
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada sales order
                  </p>
                  <p style={{ fontSize: 14 }}>Sales order akan muncul setelah quotation dikonfirmasi.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/sales-orders" />
    </div>
  );
}
