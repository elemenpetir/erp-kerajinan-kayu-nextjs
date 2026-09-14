import { createClient } from '../../../../lib/supabase/server';
import { getQuotationsPage, PAGE_SIZE } from '../../../../lib/services/sales';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteQuotation } from './actions';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getQuotationsPage(supabase, { page });

  return (
    <div>
      <h2>Quotation</h2>
      <p>
        <a className="btn" href="/sales/quotations/new">
          Buat Quotation
        </a>
      </p>
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
          {items.map((q) => (
            <tr key={q.id}>
              <td>{shortId('QUO', q.id)}</td>
              <td>{q.customer_snapshot?.nama || '-'}</td>
              <td>{q.payment_terms || '-'}</td>
              <td>Rp {Number(q.total_biaya || 0).toLocaleString('id-ID')}</td>
              <td>{q.status}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/sales/quotations/${q.id}`}>Lihat</a>
                  {q.status !== 'Sales Order' && (
                    <ActionButton
                      run={deleteQuotation.bind(null, q.id)}
                      confirmText="Hapus quotation ini?"
                      label="Hapus"
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada quotation
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Buat Quotation" untuk membuat penawaran pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/quotations" />
    </div>
  );
}
