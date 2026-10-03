'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import SearchForm from '@/components/ui/SearchForm';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';
import { CreateForm, RowActions } from './_components/DepartemenForm';

const PAGE_SIZE = 20;

export default function DepartmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();
  const { role } = useRole();

  const { data, error, isLoading, isValidating, mutate } = useList('departments', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Departemen</h1>
          <p className="text-sm text-muted-foreground">Struktur organisasi dan penanggung jawab tiap unit.</p>
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
  const employees = data?.employees || [];

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
      <div>
        <h1 className="text-lg font-semibold">Departemen</h1>
        <p className="text-sm text-muted-foreground">Struktur organisasi dan penanggung jawab tiap unit.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {can(role, 'create', 'departments') && (
            <CreateForm employees={employees} onSuccess={() => mutate()} />
          )}
        </CardContent>
      </Card>
      <SearchForm q={q} onSearch={applyFilters} placeholder="Cari departemen / manager..." busy={isValidating} />
      <Card className={isValidating ? 'opacity-60 transition-opacity' : undefined}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="w-44">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{docCode('DEPT', d.kode, d.id)}</TableCell>
                  <TableCell className="font-medium">{d.nama_departemen}</TableCell>
                  <TableCell>{d.manager || '-'}</TableCell>
                  <TableCell>
                    <RowActions dept={d} employees={employees} onSuccess={() => mutate()} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={Building2}
              title="Belum ada departemen."
              description="Tambah departemen pertama menggunakan form di atas."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/hr/departments" onPageChange={goToPage} />
    </div>
  );
}
