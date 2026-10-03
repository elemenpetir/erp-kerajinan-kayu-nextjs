'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Handshake, Plus, Search } from 'lucide-react';
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
import { deleteCustomer } from './actions';

const PAGE_SIZE = 20;

export default function CustomersList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();
  const { role } = useRole();

  const { data, error, isLoading, mutate } = useList('customers', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Customer</h1>
            <p className="text-sm text-muted-foreground">Daftar pelanggan dan prospek.</p>
          </div>
          {can(role, 'create', 'customers') && (
            <Button asChild>
              <Link href="/sales/customers/new">
                <Plus />
                Tambah Customer
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
          <h1 className="text-lg font-semibold">Customer</h1>
          <p className="text-sm text-muted-foreground">Daftar pelanggan dan prospek.</p>
        </div>
        {can(role, 'create', 'customers') && (
          <Button asChild>
            <Link href="/sales/customers/new">
              <Plus />
              Tambah Customer
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
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{docCode('CUST', c.kode, c.id)}</TableCell>
                  <TableCell className="font-medium">{c.nama}</TableCell>
                  <TableCell>{c.nama_perusahaan || '-'}</TableCell>
                  <TableCell className="tabular-nums">{c.telp || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email || '-'}</TableCell>
                  <TableCell>
                    <RowActions entity="customers"
                      viewHref={`/sales/customers/${c.id}`}
                      onSuccess={() => mutate()}
                      actions={[
                        {
                          label: 'Hapus',
                          run: deleteCustomer.bind(null, c.id),
                          confirmTitle: 'Hapus customer?',
                          confirmText: 'Hapus customer ini?',
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
              icon={Handshake}
              title="Belum ada customer"
              description='Klik "Tambah Customer" untuk mendaftarkan customer pertama.'
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/sales/customers" onPageChange={goToPage} />
    </div>
  );
}
