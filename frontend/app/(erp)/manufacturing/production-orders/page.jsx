import { createClient } from '../../../../lib/supabase/server';
import { getProductionOrdersPage, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { shortId } from '../../../../lib/utils/format';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteProductionOrder } from './actions';

export const dynamic = 'force-dynamic';

export default async function ProductionOrdersPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getProductionOrdersPage(supabase, { page });

  return (
    <div>
      <h2>Order Produksi</h2>
      <p>
        <a className="btn" href="/manufaktur/order-produksi/create">
          Buat Order
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Produk</th>
            <th>Jumlah</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((order) => (
            <tr key={order.id}>
              <td>{shortId('ORP', order.id)}</td>
              <td>{order.produk?.nama || '-'}</td>
              <td>{order.jumlah_produk}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/manufaktur/order-produksi/${order.id}`}>Lihat</a>
                  {order.status === 'Draft' && (
                    <ActionButton
                      run={deleteProductionOrder.bind(null, order.id)}
                      confirmText="Hapus order produksi ini?"
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏭</div>
                  <p style={{ fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                    Belum ada order produksi
                  </p>
                  <p style={{ fontSize: 14 }}>Klik "Buat Order" untuk memulai order produksi pertama.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/production-orders" />
    </div>
  );
}
