'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Factory, Plus } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { deleteProductionOrder } from './actions';

const PAGE_SIZE = 20;

export default function ProductionOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const { role } = useRole();

  const { data, error, isLoading, mutate } = useList('production-orders', { page });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Order Produksi</h1>
            <p className="text-sm text-muted-foreground">Draft → Konfirmasi → Dalam Proses → Selesai.</p>
          </div>
          {can(role, 'create', 'production-orders') && (
            <Button asChild>
              <Link href="/manufacturing/production-orders/new">
                <Plus />
                Buat Order
              </Link>
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Gagal memuat data: {error.message}</p>
        <Button onClick={() => router.refresh()}>Coba Lagi</Button>
      </div>
    );
  }

  const items = data?.items || [];
  const count = data?.count || 0;
  const safePage = data?.page || page;

  function goToPage(newPage) {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
    if (newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Order Produksi</h1>
          <p className="text-sm text-muted-foreground">Draft → Konfirmasi → Dalam Proses → Selesai.</p>
        </div>
        {can(role, 'create', 'production-orders') && (
          <Button asChild>
            <Link href="/manufacturing/production-orders/new">
              <Plus />
              Buat Order
            </Link>
          </Button>
        )}
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
                <TableHead className="w-16">Aksi</TableHead>
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
                    <RowActions entity="production-orders"
                      viewHref={`/manufacturing/production-orders/${order.id}`}
                      onSuccess={() => mutate()}
                      actions={[
                        ...(order.status === 'Draft'
                          ? [
                              {
                                label: 'Hapus',
                                run: deleteProductionOrder.bind(null, order.id),
                                confirmTitle: 'Hapus order?',
                                confirmText: 'Hapus order produksi ini? Hanya order Draft yang bisa dihapus.',
                                variant: 'destructive',
                              },
                            ]
                          : []),
                      ]}
                    />
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
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/production-orders" onPageChange={goToPage} />
    </div>
  );
}
