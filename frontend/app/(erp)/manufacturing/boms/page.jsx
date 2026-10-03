'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
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

export default function BomsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();
  const { role } = useRole();

  const { data, error, isLoading, isValidating, mutate } = useList('boms', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Bill of Materials</h1>
            <p className="text-sm text-muted-foreground">Komposisi bahan dan biaya tiap produk.</p>
          </div>
          {can(role, 'create', 'boms') && (
            <Button asChild>
              <Link href="/manufacturing/boms/new">
                <Plus />
                Tambah BOM
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
          <h1 className="text-lg font-semibold">Bill of Materials</h1>
          <p className="text-sm text-muted-foreground">Komposisi bahan dan biaya tiap produk.</p>
        </div>
        {can(role, 'create', 'boms') && (
          <Button asChild>
            <Link href="/manufacturing/boms/new">
              <Plus />
              Tambah BOM
            </Link>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <SearchForm q={q} onSearch={applyFilters} placeholder="Cari nama produk..." busy={isValidating} />
        <ExportButtons
          entity="boms"
          q={q}
          filename="boms"
          columns={[
            { header: 'Kode', get: (r) => docCode('BOM', r.kode, r.id) },
            { header: 'Produk', get: (r) => r.produk?.nama || '-' },
            { header: 'Total Biaya Produk', get: (r) => r.total_biaya_produk ?? 0 },
            { header: 'Total Biaya Bahan', get: (r) => r.total_biaya_bahan ?? 0 },
          ]}
        />
      </div>
      <Card className={isValidating ? 'opacity-60 transition-opacity' : undefined}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Total Biaya Produk</TableHead>
                <TableHead className="text-right">Total Biaya Bahan</TableHead>
                <TableHead className="w-24">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{docCode('BOM', b.kode, b.id)}</TableCell>
                  <TableCell className="font-medium">{b.produk?.nama || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya_produk || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya_bahan || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/manufacturing/boms/${b.id}`}>Lihat</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada Bill of Materials"
              description="Buat BOM dari halaman detail produk."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/boms" onPageChange={goToPage} />
    </div>
  );
}
