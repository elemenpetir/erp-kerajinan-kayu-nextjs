import { Receipt } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getVendorBillsPage, getVendorBillsTotal, PAGE_SIZE } from '../../../../lib/services/accounting';
import { formatRupiah } from '../../../../lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function VendorBillsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getVendorBillsPage(supabase, { page });
  const grandTotal = await getVendorBillsTotal(supabase);

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
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/accounting/vendor-bills" />
    </div>
  );
}
