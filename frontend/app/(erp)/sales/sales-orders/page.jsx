import { ShoppingBag } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getSalesOrdersPage, PAGE_SIZE } from '../../../../lib/services/sales';
import { docCode } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { createInvoice } from './actions';

export const dynamic = 'force-dynamic';

export default async function SalesOrdersPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getSalesOrdersPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Sales Orders</h1>
        <p className="text-sm text-muted-foreground">Terbentuk dari quotation yang dikonfirmasi.</p>
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
                    <RowActions
                      viewHref={`/sales/sales-orders/${o.id}`}
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
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/sales-orders" />
    </div>
  );
}