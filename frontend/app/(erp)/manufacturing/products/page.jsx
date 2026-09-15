import { Package, Plus } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getProductsPage, getProductStockMap, getProductBomMap, PAGE_SIZE } from '../../../../lib/services/manufacturing';
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
  if (stok <= 5) return 'font-semibold text-amber-600';
  return 'font-semibold text-emerald-600';
}

export default async function ProductsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getProductsPage(supabase, { page });
  const ids = items.map((p) => p.id);
  const [stokMap, bomMap] = await Promise.all([
    getProductStockMap(supabase, ids),
    getProductBomMap(supabase, ids),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Produk</h1>
          <p className="text-sm text-muted-foreground">Kelola produk kerajinan kayu beserta stoknya.</p>
        </div>
        <Button asChild>
          <a href="/manufacturing/products/new">
            <Plus />
            Buat Produk
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
                <TableHead className="text-right">Harga Produksi</TableHead>
                <TableHead className="text-right">Biaya Produksi</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="w-28">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{docCode('PRD', p.kode, p.id)}</TableCell>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(p.harga_produksi || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {(bomMap[p.id] || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${stokClass(stokMap[p.id])}`}>
                    {stokMap[p.id] ?? 0}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/manufacturing/products/${p.id}`}>Lihat</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={Package}
              title="Belum ada produk"
              description='Klik "Buat Produk" untuk menambahkan produk pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/products" />
    </div>
  );
}
