import { Plus, TreePine } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getMaterialsPage, getMaterialStockMap, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { docCode, shortId } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

export const dynamic = 'force-dynamic';

function stokClass(stok) {
  if (stok === undefined) return 'text-muted-foreground';
  if (stok <= 0) return 'font-semibold text-destructive';
  if (stok <= 10) return 'font-semibold text-amber-600';
  return 'font-semibold text-emerald-600';
}

export default async function MaterialsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getMaterialsPage(supabase, { page });
  const stokMap = await getMaterialStockMap(
    supabase,
    items.map((b) => b.id),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Bahan</h1>
          <p className="text-sm text-muted-foreground">Kelola bahan baku beserta stoknya.</p>
        </div>
        <Button asChild>
          <a href="/manufacturing/materials/new">
            <Plus />
            Tambah Bahan
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
                <TableHead className="text-right">Biaya</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead>Referensi</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{docCode('BHN', b.kode, b.id)}</TableCell>
                  <TableCell className="font-medium">{b.nama}</TableCell>
                  <TableCell className="text-right tabular-nums">{(b.biaya || 0).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-right tabular-nums">{(b.harga || 0).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-muted-foreground">{b.internal_referensi || '-'}</TableCell>
                  <TableCell className={`text-right tabular-nums ${stokClass(stokMap[b.id])}`}>
                    {stokMap[b.id] ?? 0}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/manufacturing/materials/${b.id}`}>Lihat</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={TreePine}
              title="Belum ada bahan"
              description='Klik "Tambah Bahan" untuk menambahkan bahan baku pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/materials" />
    </div>
  );
}
