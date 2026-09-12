import { createClient } from '../../../../lib/supabase/server';
import { getVendorBillsPage, PAGE_SIZE } from '../../../../lib/services/accounting';
import { formatRupiah } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function VendorBillsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getVendorBillsPage(supabase, { page });
  const pageTotal = items.reduce((s, b) => s + parseFloat(b.jumlah_pembayaran || 0), 0);

  return (
    <div>
      <h2>Accounting — Vendor Bills</h2>
      {items.length === 0 ? (
        <p>Tidak ada data vendor bill.</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nomor Bill</th>
              <th>Referensi</th>
              <th>Vendor</th>
              <th>Jumlah Pembayaran</th>
              <th>Tanggal Pembayaran</th>
              <th>Status Bill</th>
            </tr>
          </thead>
          <tbody>
            {items.map((bill, index) => (
              <tr key={bill.id}>
                <td>BILL-{String((safePage - 1) * PAGE_SIZE + index + 1).padStart(3, '0')}</td>
                <td>{bill.bills?.referensi_vendor || '-'}</td>
                <td>{bill.vendor_nama}</td>
                <td>{formatRupiah(bill.jumlah_pembayaran)}</td>
                <td>{bill.payment_date}</td>
                <td>{bill.bills?.status || '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                Total halaman ini
              </td>
              <td style={{ fontWeight: 'bold' }}>{formatRupiah(pageTotal)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/accounting/vendor-bills" />
    </div>
  );
}
