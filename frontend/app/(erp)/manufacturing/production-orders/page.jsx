import { Factory, Plus } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getProductionOrdersPage, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { docCode, shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteProductionOrder } from './actions';

export const dynamic = 'force-dynamic';

export default async function ProductionOrdersPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getProductionOrdersPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Order Produksi</h1>
          <p className="text-sm text-muted-foreground">Draft → Konfirmasi → Dalam Proses → Selesai.</p>
        </div>
        <Button asChild>
          <a href="/manufacturing/production-orders/new">
            <Plus />
            Buat Order
          </a>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{docCode('ORP', order.kode, order.id)}</TableCell>
                  <TableCell className="font-medium">{order.produk?.nama || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">{order.jumlah_produk}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/manufacturing/production-orders/${order.id}`}>Lihat</a>
                      </Button>
                      {order.status === 'Draft' && (
                        <ActionButton
                          run={deleteProductionOrder.bind(null, order.id)}
                          confirmTitle="Hapus order?"
                          confirmText="Hapus order produksi ini? Hanya order Draft yang bisa dihapus."
                          label="Hapus"
                          variant="destructive"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={Factory}
              title="Belum ada order produksi"
              description='Klik "Buat Order" untuk memulai order produksi pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/production-orders" />
    </div>
  );
}
