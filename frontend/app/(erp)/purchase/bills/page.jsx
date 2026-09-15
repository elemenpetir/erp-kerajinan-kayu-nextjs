import { Plus, Receipt } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getBillsPage, PAGE_SIZE } from '../../../../lib/services/purchase';
import { shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteBill, confirmBill, payBill } from './actions';

export const dynamic = 'force-dynamic';

export default async function BillsList({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getBillsPage(supabase, { page });

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
                <TableHead className="w-48">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{shortId('BILL', b.id)}</TableCell>
                  <TableCell className="font-medium">{b.referensi_vendor || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{b.deadline_order || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/purchase/bills/${b.id}`}>Lihat</a>
                      </Button>
                      {b.status === 'Bill' && (
                        <ActionButton
                          run={payBill.bind(null, b.id)}
                          confirmTitle="Bayar bill?"
                          confirmText="Bayar bill ini? Data akan masuk ke Vendor Bill Accounting."
                          successText="Bill berhasil dibayar!"
                          label="Bayar"
                        />
                      )}
                      {b.status === 'Draft Bill' && (
                        <ActionButton
                          run={confirmBill.bind(null, b.id)}
                          confirmTitle="Konfirmasi bill?"
                          confirmText="Konfirmasi bill ini?"
                          label="Konfirmasi"
                          variant="secondary"
                        />
                      )}
                      {b.status === 'Draft Bill' && (
                        <ActionButton
                          run={deleteBill.bind(null, b.id)}
                          confirmTitle="Hapus bill?"
                          confirmText="Hapus bill ini?"
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
              icon={Receipt}
              title="Belum ada tagihan"
              description='Klik "Buat Bill" untuk mencatat tagihan pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/purchase/bills" />
    </div>
  );
}
