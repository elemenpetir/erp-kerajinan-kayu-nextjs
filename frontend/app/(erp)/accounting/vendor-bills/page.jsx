'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { formatRupiah } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';

const PAGE_SIZE = 20;

export default function VendorBillsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, error, isLoading } = useList('vendor-bills', { page });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Vendor Bills</h1>
          <p className="text-sm text-muted-foreground">Ringkasan tagihan vendor yang sudah dibayar.</p>
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
  const grandTotal = data?.grandTotal || 0;

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
      <div>
        <h1 className="text-lg font-semibold">Vendor Bills</h1>
        <p className="text-sm text-muted-foreground">Ringkasan tagihan vendor yang sudah dibayar.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Bill</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Jumlah Pembayaran</TableHead>
                <TableHead>Tanggal Pembayaran</TableHead>
                <TableHead>Status Bill</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((bill, index) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-mono text-xs">
                    BILL-{String((safePage - 1) * PAGE_SIZE + index + 1).padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-medium">{bill.bills?.referensi_vendor || '-'}</TableCell>
                  <TableCell>{bill.vendor_nama}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRupiah(bill.jumlah_pembayaran)}</TableCell>
                  <TableCell className="text-muted-foreground">{bill.payment_date}</TableCell>
                  <TableCell>
                    <StatusBadge status={bill.bills?.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {items.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total keseluruhan
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(grandTotal)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
          {items.length === 0 && (
            <EmptyState icon={Receipt} title="Tidak ada data vendor bill." />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/accounting/vendor-bills" onPageChange={goToPage} />
    </div>
  );
}
