'use client';

import { Package, Plus } from 'lucide-react';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import ViewToggle, { usePersistedView } from '@/components/ui/ViewToggle';
import RowActions from '@/components/ui/RowActions';
import { deleteProduct } from '../actions';

function monogram(nama) {
  const clean = String(nama || '').trim();
  return clean.slice(0, 2).toUpperCase() || '•';
}

function stokClass(stok) {
  if (stok === undefined || stok === null) return 'text-muted-foreground';
  if (stok <= 0) return 'font-semibold text-destructive';
  if (stok <= 5) return 'font-semibold text-amber-600';
  return 'font-semibold text-emerald-600';
}

function ProductTable({ items }) {
  return (
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
              <TableHead className="w-16">Aksi</TableHead>
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
                  {(p._biaya || 0).toLocaleString('id-ID')}
                </TableCell>
                <TableCell className={`text-right tabular-nums ${stokClass(p._stok)}`}>
                  {p._stok ?? 0}
                </TableCell>
                <TableCell>
                  <RowActions
                    viewHref={`/manufacturing/products/${p.id}`}
                    actions={[
                      {
                        label: 'Hapus',
                        run: deleteProduct.bind(null, p.id),
                        confirmTitle: 'Hapus produk?',
                        confirmText: 'Hapus produk ini? BOM terkait ikut terhapus.',
                        variant: 'destructive',
                      },
                    ]}
                  />
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
  );
}

function ProductGrid({ items }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={Package}
            title="Belum ada produk"
            description='Klik "Buat Produk" untuk menambahkan produk pertama.'
          />
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {items.map((p) => (
        <Card key={p.id} className="overflow-hidden">
          {p.gambar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.gambar_url} alt={p.nama || 'Produk'} className="aspect-square w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-muted" aria-hidden="true">
              <span className="text-3xl font-semibold text-muted-foreground">{monogram(p.nama)}</span>
            </div>
          )}
          <CardContent className="space-y-1 p-4">
            <p className="font-mono text-xs text-muted-foreground">{docCode('PRD', p.kode, p.id)}</p>
            <p className="truncate font-medium" title={p.nama}>
              {p.nama}
            </p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {(p.harga_produksi || 0).toLocaleString('id-ID')}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className={`text-sm tabular-nums ${stokClass(p._stok)}`}>Stok {p._stok ?? 0}</span>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/manufacturing/products/${p.id}`}>Lihat</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ProductViews({ items }) {
  const [view, setView] = usePersistedView('view:products', 'list');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} produk di halaman ini
        </p>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button asChild>
            <a href="/manufacturing/products/new">
              <Plus />
              Buat Produk
            </a>
          </Button>
        </div>
      </div>
      {view === 'grid' ? <ProductGrid items={items} /> : <ProductTable items={items} />}
    </div>
  );
}