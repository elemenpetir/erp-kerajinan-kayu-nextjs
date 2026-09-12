import { createClient } from '../../../../lib/supabase/server';
import { getCustomerInvoicesPage, PAGE_SIZE } from '../../../../lib/services/accounting';
import { formatRupiah } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function CustomerInvoicesPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getCustomerInvoicesPage(supabase, { page });
  const pageTotal = items.reduce((s, inv) => s + parseFloat(inv.jumlah_pembayaran || 0), 0);

  return (
    <div>
      <h2>Accounting — Customer Invoices</h2>
      {items.length === 0 ? (
        <p>Tidak ada data customer invoice.</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nomor Invoice</th>
              <th>Customer</th>
              <th>Jumlah Pembayaran</th>
              <th>Tanggal Pembayaran</th>
              <th>Status Sales Order</th>
            </tr>
          </thead>
          <tbody>
            {items.map((invoice, index) => (
              <tr key={invoice.id || index}>
                <td>INV-{String((safePage - 1) * PAGE_SIZE + index + 1).padStart(3, '0')}</td>
                <td>{invoice.sales_order?.customer_snapshot?.nama || '-'}</td>
                <td>{formatRupiah(invoice.jumlah_pembayaran)}</td>
                <td>{invoice.payment_date}</td>
                <td>{invoice.sales_order?.status || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                Total halaman ini
              </td>
              <td style={{ fontWeight: 'bold' }}>{formatRupiah(pageTotal)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/accounting/customer-invoices" />
    </div>
  );
}
