import { Layers } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getCategoriesPage, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import ActionButton from '../../../../components/ui/ActionButton';
import CategoryForm from './_components/CategoryForm';
import { deleteCategory } from './actions';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getCategoriesPage(supabase, { page });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Kategori</h1>
        <p className="text-sm text-muted-foreground">Kelompok produk untuk katalog dan laporan.</p>
      </div>
      <CategoryForm />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-28">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((kategori) => (
                <TableRow key={kategori.id}>
                  <TableCell className="font-medium">{kategori.nama}</TableCell>
                  <TableCell>
                    <ActionButton
                      run={deleteCategory.bind(null, kategori.id)}
                      confirmTitle="Hapus kategori?"
                      confirmText="Hapus kategori ini? Produk yang memakai kategori ini tidak ikut terhapus."
                      label="Hapus"
                      variant="destructive"
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
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/categories" />
    </div>
  );
}
