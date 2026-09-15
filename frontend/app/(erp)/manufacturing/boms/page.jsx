import { ClipboardList, Plus } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getBomsPage, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { docCode, shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

export default async function BomsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getBomsPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bill of Materials</h1>
          <p className="text-sm text-muted-foreground">Komposisi bahan dan biaya tiap produk.</p>
        </div>
        <Button asChild>
          <a href="/manufacturing/boms/new">
            <Plus />
            Tambah BOM
          </a>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Total Biaya Produk</TableHead>
                <TableHead className="text-right">Total Biaya Bahan</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{docCode('BOM', b.kode, b.id)}</TableCell>
                  <TableCell className="font-medium">{b.produk?.nama || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya_produk || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya_bahan || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/manufacturing/boms/${b.id}`}>Lihat</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada Bill of Materials"
              description="Buat BOM dari halaman detail produk."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/boms" />
    </div>
  );
}
