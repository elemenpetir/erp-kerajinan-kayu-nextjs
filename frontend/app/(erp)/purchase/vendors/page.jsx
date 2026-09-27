'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Store } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
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

  const { data, error, isLoading, mutate } = useList('vendors', { page });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Vendor</h1>
            <p className="text-sm text-muted-foreground">Daftar pemasok bahan baku.</p>
          </div>
          <Button asChild>
            <Link href="/purchase/vendors/new">
              <Plus />
              Tambah Vendor
            </Link>
          </Button>
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Vendor</h1>
          <p className="text-sm text-muted-foreground">Daftar pemasok bahan baku.</p>
        </div>
        <Button asChild>
          <Link href="/purchase/vendors/new">
            <Plus />
            Tambah Vendor
          </Link>
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
                    <RowActions
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
