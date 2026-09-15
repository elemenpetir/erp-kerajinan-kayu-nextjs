import { Plus, Store } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getVendorsPage, PAGE_SIZE } from '../../../../lib/services/purchase';
import { docCode, shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import { deleteVendor } from './actions';

export const dynamic = 'force-dynamic';

export default async function VendorsList({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getVendorsPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Vendor</h1>
          <p className="text-sm text-muted-foreground">Daftar pemasok bahan baku.</p>
        </div>
        <Button asChild>
          <a href="/purchase/vendors/new">
            <Plus />
            Tambah Vendor
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
              {items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{docCode('VND', v.kode, v.id)}</TableCell>
                  <TableCell className="font-medium">{v.nama}</TableCell>
                  <TableCell>{v.nama_perusahaan || '-'}</TableCell>
                  <TableCell className="tabular-nums">{v.telp || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{v.email || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/purchase/vendors/${v.id}`}>Lihat</a>
                      </Button>
                      <ActionButton
                        run={deleteVendor.bind(null, v.id)}
                        confirmTitle="Hapus vendor?"
                        confirmText={`Hapus vendor "${v.nama}"?`}
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
              icon={Store}
              title="Belum ada vendor"
              description='Klik "Tambah Vendor" untuk mendaftarkan vendor pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/purchase/vendors" />
    </div>
  );
}
