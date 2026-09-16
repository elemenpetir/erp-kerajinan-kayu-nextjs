import { Landmark } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getCustomerInvoicesPage, getCustomerInvoicesTotal, PAGE_SIZE } from '../../../../lib/services/accounting';
import { formatRupiah } from '../../../../lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function CustomerInvoicesPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getCustomerInvoicesPage(supabase, { page });
  const grandTotal = await getCustomerInvoicesTotal(supabase);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Customer Invoices</h1>
        <p className="text-sm text-muted-foreground">Ringkasan invoice dari sales order yang sudah terbayar penuh.</p>
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
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/accounting/customer-invoices" />
    </div>
  );
}
