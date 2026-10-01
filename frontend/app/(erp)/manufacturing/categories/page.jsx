'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useList } from '@/hooks/useList';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import RowActions from '@/components/ui/RowActions';
import CategoryForm from './_components/CategoryForm';
import { deleteCategory } from './actions';

const PAGE_SIZE = 20;

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const { role } = useRole();

  const { data, error, isLoading, mutate } = useList('categories', { page });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Kategori</h1>
          <p className="text-sm text-muted-foreground">Kelompok produk untuk katalog dan laporan.</p>
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
      <div>
        <h1 className="text-lg font-semibold">Kategori</h1>
        <p className="text-sm text-muted-foreground">Kelompok produk untuk katalog dan laporan.</p>
      </div>
      {can(role, 'create', 'categories') && <CategoryForm onSuccess={() => mutate()} />}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-16">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((kategori) => (
                <TableRow key={kategori.id}>
                  <TableCell className="font-medium">{kategori.nama}</TableCell>
                  <TableCell>
                    <RowActions entity="categories"
                      onSuccess={() => mutate()}
                      actions={[
                        {
                          label: 'Hapus',
                          run: deleteCategory.bind(null, kategori.id),
                          confirmTitle: 'Hapus kategori?',
                          confirmText: 'Hapus kategori ini? Produk yang memakai kategori ini tidak ikut terhapus.',
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
              icon={Layers}
              title="Belum ada kategori"
              description="Tambah kategori pertama menggunakan form di atas."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/categories" onPageChange={goToPage} />
    </div>
  );
}
