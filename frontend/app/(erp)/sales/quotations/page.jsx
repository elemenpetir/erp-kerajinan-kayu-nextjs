import { FileText, Plus } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getQuotationsPage, PAGE_SIZE } from '../../../../lib/services/sales';
import { shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteQuotation } from './actions';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getQuotationsPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Quotation</h1>
          <p className="text-sm text-muted-foreground">Penawaran harga, konfirmasi menjadi sales order.</p>
        </div>
        <Button asChild>
          <a href="/sales/quotations/new">
            <Plus />
            Buat Quotation
          </a>
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
                <TableHead className="w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs">{shortId('QUO', q.id)}</TableCell>
                  <TableCell className="font-medium">{q.customer_snapshot?.nama || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{q.payment_terms || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    Rp {Number(q.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/sales/quotations/${q.id}`}>Lihat</a>
                      </Button>
                      {q.status !== 'Sales Order' && (
                        <ActionButton
                          run={deleteQuotation.bind(null, q.id)}
                          confirmTitle="Hapus quotation?"
                          confirmText="Hapus quotation ini?"
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
              icon={FileText}
              title="Belum ada quotation"
              description='Klik "Buat Quotation" untuk membuat penawaran pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/quotations" />
    </div>
  );
}
