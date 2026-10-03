'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Store } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import { deleteVendor } from './actions';

const PAGE_SIZE = 20;

export default function VendorsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();
  const { role } = useRole();

  const { data, error, isLoading, mutate } = useList('vendors', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Vendor</h1>
            <p className="text-sm text-muted-foreground">Daftar pemasok bahan baku.</p>
          </div>
          {can(role, 'create', 'vendors') && (
            <Button asChild>
              <Link href="/purchase/vendors/new">
                <Plus />
                Tambah Vendor
              </Link>
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Gagal memuat data: {error.message}</p>
        <Button onClick={() => router.refresh()}>Coba Lagi</Button>
      </div>
    );
  }

  const items = data?.items || [];
  const count = data?.count || 0;
  const safePage = data?.page || page;

  function goToPage(newPage) {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
    if (newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh();
  }

  function applyFilters(newParams) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    params.delete('page');
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh();
    mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Vendor</h1>
          <p className="text-sm text-muted-foreground">Daftar pemasok bahan baku.</p>
        </div>
        {can(role, 'create', 'vendors') && (
          <Button asChild>
            <Link href="/purchase/vendors/new">
              <Plus />
              Tambah Vendor
            </Link>
          </Button>
        )}
      </div>
      <form
        key={q}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          applyFilters({ q: fd.get('q') || '' });
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <div className="grid gap-1">
          <Label htmlFor="q">Cari</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Cari nama / perusahaan / email..." className="h-8 w-64" />
        </div>
        <Button type="submit" variant="secondary" size="sm" aria-label="Cari">
          <Search />
          Cari
        </Button>
        {q && (
          <Button variant="ghost" size="sm" onClick={() => applyFilters({ q: '' })}>
            Reset
          </Button>
        )}
      </form>
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
                <TableHead className="w-16">Aksi</TableHead>
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
                    <RowActions entity="vendors"
                      viewHref={`/purchase/vendors/${v.id}`}
                      onSuccess={() => mutate()}
                      actions={[
                        {
                          label: 'Hapus',
                          run: deleteVendor.bind(null, v.id),
                          confirmTitle: 'Hapus vendor?',
                          confirmText: `Hapus vendor "${v.nama}"?`,
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
              icon={Store}
              title="Belum ada vendor"
              description='Klik "Tambah Vendor" untuk mendaftarkan vendor pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/purchase/vendors" onPageChange={goToPage} />
    </div>
  );
}
