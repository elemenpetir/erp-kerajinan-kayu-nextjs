'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { deleteQuotation } from './actions';

const PAGE_SIZE = 20;

export default function QuotationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, error, isLoading, mutate } = useList('quotations', { page });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Quotation</h1>
            <p className="text-sm text-muted-foreground">Penawaran harga, konfirmasi menjadi sales order.</p>
          </div>
          <Button asChild>
            <Link href="/sales/quotations/new">
              <Plus />
              Buat Quotation
            </Link>
          </Button>
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
          <h1 className="text-lg font-semibold">Quotation</h1>
          <p className="text-sm text-muted-foreground">Penawaran harga, konfirmasi menjadi sales order.</p>
        </div>
        <Button asChild>
          <Link href="/sales/quotations/new">
            <Plus />
            Buat Quotation
          </Link>
        </Button>
      </div>
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
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">{docCode('QUO', q.kode, q.id)}</TableCell>
                  <TableCell className="font-medium">{q.customer_snapshot?.nama || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{q.payment_terms || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    Rp {Number(q.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>
                    <RowActions
                      viewHref={`/sales/quotations/${q.id}`}
                      onSuccess={() => mutate()}
                      actions={[
                        ...(q.status !== 'Sales Order'
                          ? [
                              {
                                label: 'Hapus',
                                run: deleteQuotation.bind(null, q.id),
                                confirmTitle: 'Hapus quotation?',
                                confirmText: 'Hapus quotation ini?',
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
              icon={FileText}
              title="Belum ada quotation"
              description='Klik "Buat Quotation" untuk membuat penawaran pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/quotations" onPageChange={goToPage} />
    </div>
  );
}
