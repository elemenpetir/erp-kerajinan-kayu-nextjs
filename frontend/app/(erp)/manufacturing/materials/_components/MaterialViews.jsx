'use client';

import { Plus, TreePine } from 'lucide-react';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import ViewToggle, { usePersistedView } from '@/components/ui/ViewToggle';
import RowActions from '@/components/ui/RowActions';
import { deleteMaterial } from '../actions';

function monogram(nama) {
  const clean = String(nama || '').trim();
  return clean.slice(0, 2).toUpperCase() || '•';
}

function stokClass(stok) {
  if (stok === undefined || stok === null) return 'text-muted-foreground';
  if (stok <= 0) return 'font-semibold text-destructive';
  if (stok <= 10) return 'font-semibold text-amber-600';
  return 'font-semibold text-emerald-600';
}

function MaterialTable({ items }) {
  return (
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
              <TableHead className="w-16">Aksi</TableHead>
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
                <TableCell className={`text-right tabular-nums ${stokClass(b._stok)}`}>
                  {b._stok ?? 0}
                </TableCell>
                <TableCell>
                  <RowActions
                    viewHref={`/manufacturing/materials/${b.id}`}
                    actions={[
                      {
                        label: 'Hapus',
                        run: deleteMaterial.bind(null, b.id),
                        confirmTitle: 'Hapus bahan?',
                        confirmText: 'Hapus bahan ini?',
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
            icon={TreePine}
            title="Belum ada bahan"
            description='Klik "Tambah Bahan" untuk menambahkan bahan baku pertama.'
          />
        )}
      </CardContent>
    </Card>
  );
}

function MaterialGrid({ items }) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={TreePine}
            title="Belum ada bahan"
            description='Klik "Tambah Bahan" untuk menambahkan bahan baku pertama.'
          />
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {items.map((b) => (
        <Card key={b.id} className="overflow-hidden">
          {b.gambar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.gambar_url} alt={b.nama || 'Bahan'} className="aspect-square w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-muted" aria-hidden="true">
              <span className="text-3xl font-semibold text-muted-foreground">{monogram(b.nama)}</span>
            </div>
          )}
          <CardContent className="space-y-1 p-4">
            <p className="font-mono text-xs text-muted-foreground">{docCode('BHN', b.kode, b.id)}</p>
            <p className="truncate font-medium" title={b.nama}>
              {b.nama}
            </p>
            <p className="text-sm tabular-nums text-muted-foreground">
              {(b.harga || 0).toLocaleString('id-ID')}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className={`text-sm tabular-nums ${stokClass(b._stok)}`}>Stok {b._stok ?? 0}</span>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/manufacturing/materials/${b.id}`}>Lihat</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MaterialViews({ items }) {
  const [view, setView] = usePersistedView('view:materials', 'list');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} bahan di halaman ini
        </p>
        <div className="flex items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button asChild>
            <a href="/manufacturing/materials/new">
              <Plus />
              Tambah Bahan
            </a>
          </Button>
        </div>
      </div>
      {view === 'grid' ? <MaterialGrid items={items} /> : <MaterialTable items={items} />}
    </div>
  );
}