'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Plus, Receipt } from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { deleteBill, confirmBill, payBill } from './actions';

const PAGE_SIZE = 20;

export default function BillsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, error, isLoading } = useBills(page);

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Bills</h1>
            <p className="text-sm text-muted-foreground">Draft Bill → Bill → Paid.</p>
          </div>
          <Button asChild>
            <a href="/purchase/bills/new">
              <Plus />
              Buat Bill
            </a>
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

  // Handle pagination with pushState (no reload)
  function goToPage(newPage) {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
    if (newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh(); // triggers SWR re-fetch via key change
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bills</h1>
          <p className="text-sm text-muted-foreground">Draft Bill → Bill → Paid.</p>
        </div>
        <Button asChild>
          <a href="/purchase/bills/new">
            <Plus />
            Buat Bill
          </a>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Referensi Vendor</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{docCode('BILL', b.kode, b.id)}</TableCell>
                  <TableCell className="font-medium">{b.referensi_vendor || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{b.deadline_order || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell>
                    <RowActions
                      viewHref={`/purchase/bills/${b.id}`}
                      actions={[
                        ...(b.status === 'Bill'
                          ? [
                              {
                                label: 'Bayar',
                                run: payBill.bind(null, b.id),
                                confirmTitle: 'Bayar bill?',
                                confirmText: 'Bayar bill ini? Data akan masuk ke Vendor Bill Accounting.',
                                successText: 'Bill berhasil dibayar!',
                              },
                            ]
                          : []),
                        ...(b.status === 'Draft Bill'
                          ? [
                              {
                                label: 'Konfirmasi',
                                run: confirmBill.bind(null, b.id),
                                confirmTitle: 'Konfirmasi bill?',
                                confirmText: 'Konfirmasi bill ini?',
                                variant: 'secondary',
                              },
                              {
                                label: 'Hapus',
                                run: deleteBill.bind(null, b.id),
                                confirmTitle: 'Hapus bill?',
                                confirmText: 'Hapus bill ini?',
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
              icon={Receipt}
              title="Belum ada tagihan"
              description='Klik "Buat Bill" untuk mencatat tagihan pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        count={count}
        basePath="/purchase/bills"
        onPageChange={goToPage}
      />
    </div>
  );
}