'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Landmark, Lock } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';
import { formatRupiah } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import ExportButtons from '@/components/ui/ExportButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';

const PAGE_SIZE = 20;

export default function CustomerInvoicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, error, isLoading } = useList('customer-invoices', { page });
  const { role } = useRole();

  if (!can(role, 'read', 'customer-invoices')) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Customer Invoices</h1>
          <p className="text-sm text-muted-foreground">Ringkasan invoice dari sales order yang sudah terbayar penuh.</p>
        </div>
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Akses ditolak. Halaman ini hanya untuk Admin dan Manager.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Customer Invoices</h1>
          <p className="text-sm text-muted-foreground">Ringkasan invoice dari sales order yang sudah terbayar penuh.</p>
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
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Customer Invoices</h1>
          <p className="text-sm text-muted-foreground">Ringkasan invoice dari sales order yang sudah terbayar penuh.</p>
        </div>
        <ExportButtons
          entity="customer-invoices"
          filename="customer-invoices"
          columns={[
            { header: 'Nomor', get: (r, i) => `INV-${String(i + 1).padStart(3, '0')}` },
            { header: 'Customer', get: (r) => r.sales_order?.customer_snapshot?.nama || '-' },
            { header: 'Jumlah', get: (r) => r.jumlah_pembayaran ?? 0 },
            { header: 'Tanggal', get: (r) => r.payment_date || '-' },
            { header: 'Status', get: (r) => r.sales_order?.status || '-' },
          ]}
          footer={({ extra }) => ['', 'Total keseluruhan', extra?.grandTotal ?? 0, '', '']}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Jumlah Pembayaran</TableHead>
                <TableHead>Tanggal Pembayaran</TableHead>
                <TableHead>Status Sales Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((invoice, index) => (
                <TableRow key={invoice.id || index}>
                  <TableCell className="font-mono text-xs">
                    INV-{String((safePage - 1) * PAGE_SIZE + index + 1).padStart(3, '0')}
                  </TableCell>
                  <TableCell className="font-medium">{invoice.sales_order?.customer_snapshot?.nama || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatRupiah(invoice.jumlah_pembayaran)}</TableCell>
                  <TableCell className="text-muted-foreground">{invoice.payment_date}</TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.sales_order?.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {items.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-right font-semibold">
                    Total keseluruhan
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(grandTotal)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
          {items.length === 0 && (
            <EmptyState icon={Landmark} title="Tidak ada data customer invoice." />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/accounting/customer-invoices" onPageChange={goToPage} />
    </div>
  );
}
