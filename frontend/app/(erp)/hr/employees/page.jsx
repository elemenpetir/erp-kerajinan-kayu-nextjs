'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, UserRound } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import SearchForm from '@/components/ui/SearchForm';
import ExportButtons from '@/components/ui/ExportButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

const PAGE_SIZE = 20;

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();
  const { role } = useRole();

  const { data, error, isLoading, isValidating, mutate } = useList('employees', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Karyawan</h1>
            <p className="text-sm text-muted-foreground">Data personel beserta unit kerjanya.</p>
          </div>
          {can(role, 'create', 'employees') && (
            <Button asChild>
              <Link href="/hr/employees/new">
                <Plus />
                Tambah Karyawan
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
          <h1 className="text-lg font-semibold">Karyawan</h1>
          <p className="text-sm text-muted-foreground">Data personel beserta unit kerjanya.</p>
        </div>
        {can(role, 'create', 'employees') && (
          <Button asChild>
            <Link href="/hr/employees/new">
              <Plus />
              Tambah Karyawan
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SearchForm q={q} onSearch={applyFilters} placeholder="Cari nama / posisi / email..." busy={isValidating} />
        <ExportButtons
          entity="employees"
          q={q}
          filename="employees"
          columns={[
            { header: 'Kode', get: (r) => docCode('EMP', r.kode, r.id) },
            { header: 'Nama', get: (r) => r.nama || '-' },
            { header: 'Posisi', get: (r) => r.posisi || '-' },
            { header: 'Telp', get: (r) => r.telp || '-' },
            { header: 'Email', get: (r) => r.email || '-' },
          ]}
        />
      </div>
      <Card className={isValidating ? 'opacity-60 transition-opacity' : undefined}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Telp</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-28">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-mono text-xs">{docCode('EMP', k.kode, k.id)}</TableCell>
                  <TableCell className="font-medium">{k.nama}</TableCell>
                  <TableCell>{k.posisi || '-'}</TableCell>
                  <TableCell className="tabular-nums">{k.telp || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{k.email || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/hr/employees/${k.id}`}>Lihat</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={UserRound}
              title="Belum ada karyawan"
              description='Klik "Tambah Karyawan" untuk mendaftarkan karyawan pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/hr/employees" onPageChange={goToPage} />
    </div>
  );
}
