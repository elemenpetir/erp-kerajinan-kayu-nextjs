import { Handshake, Plus } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getCustomersPage, PAGE_SIZE } from '../../../../lib/services/sales';
import { shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteCustomer } from './actions';

export const dynamic = 'force-dynamic';

export default async function CustomersList({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getCustomersPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">Daftar pelanggan dan prospek.</p>
        </div>
        <Button asChild>
          <a href="/sales/customers/new">
            <Plus />
            Tambah Customer
          </a>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Telp</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-36">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{shortId('CUST', c.id)}</TableCell>
                  <TableCell className="font-medium">{c.nama}</TableCell>
                  <TableCell>{c.nama_perusahaan || '-'}</TableCell>
                  <TableCell className="tabular-nums">{c.telp || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/sales/customers/${c.id}`}>Lihat</a>
                      </Button>
                      <ActionButton
                        run={deleteCustomer.bind(null, c.id)}
                        confirmTitle="Hapus customer?"
                        confirmText="Hapus customer ini?"
                        label="Hapus"
                        variant="destructive"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={Handshake}
              title="Belum ada customer"
              description='Klik "Tambah Customer" untuk mendaftarkan customer pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/customers" />
    </div>
  );
}
