'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { createInvoice } from './actions';

const PAGE_SIZE = 20;

export default function SalesOrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();

  const { data, error, isLoading, mutate } = useList('sales-orders', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">Terbentuk dari quotation yang dikonfirmasi.</p>
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

  function applyFilters(newParams) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete('page');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh();
    mutate();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Sales Orders</h1>
        <p className="text-sm text-muted-foreground">Terbentuk dari quotation yang dikonfirmasi.</p>
      </div>
      <form
        key={q}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          applyFilters({ q: fd.get('q') || '' });
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <Input id="q" name="q" aria-label="Cari" defaultValue={q} placeholder="Cari customer..." className="h-8 w-64" />
        <Button type="submit" variant="secondary" size="sm" aria-label="Cari">
          <Search />
          Cari
        </Button>
        {q && (
          <Button variant="ghost" size="sm" onClick={() => applyFilters({ q: '' })}>
            Reset
          </Button>
        )}
      </form>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-44">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{docCode('SO', o.kode, o.id)}</TableCell>
                  <TableCell className="font-medium">{o.customer_snapshot?.nama || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{o.payment_terms || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    Rp {Number(o.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <RowActions entity="sales-orders"
                      viewHref={`/sales/sales-orders/${o.id}`}
                      onSuccess={() => mutate()}
                      actions={[
                        ...(o.status === 'To Invoice'
                          ? [
                              {
                                label: 'Buat Invoice',
                                run: createInvoice.bind(null, o.id),
                                confirmTitle: 'Buat invoice?',
                                confirmText: 'Buat invoice untuk Sales Order ini?',
                                successText: 'Invoice berhasil dibuat.',
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
              icon={ShoppingBag}
              title="Belum ada sales order"
              description="Sales order akan muncul setelah quotation dikonfirmasi."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/sales-orders" onPageChange={goToPage} />
    </div>
  );
}
