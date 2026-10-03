'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { History, Search } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { shortId } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

const PAGE_SIZE = 20;

const ACTION_LABEL = { INSERT: 'Ditambah', UPDATE: 'Diubah', DELETE: 'Dihapus' };
const ACTION_VARIANT = { INSERT: 'default', UPDATE: 'secondary', DELETE: 'destructive' };

function changedFields(diff) {
  const old = diff?.old || {};
  const cur = diff?.new || {};
  const keys = [...new Set([...Object.keys(old), ...Object.keys(cur)])];
  return keys.filter((k) => JSON.stringify(old[k]) !== JSON.stringify(cur[k]));
}

function fmtVal(v) {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function ActivityReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const q = (searchParams.get('q') || '').trim();

  const { data, error, isLoading, mutate } = useList('audit-log', { page, q });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Aktivitas</h1>
          <p className="text-sm text-muted-foreground">Jejak tambah, ubah, dan hapus data di semua modul.</p>
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
      <div>
        <h1 className="text-lg font-semibold">Aktivitas</h1>
        <p className="text-sm text-muted-foreground">Jejak tambah, ubah, dan hapus data di semua modul.</p>
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
        <Input id="q" name="q" aria-label="Cari" defaultValue={q} placeholder="Cari aktor / entitas / aksi..." className="h-8 w-64" />
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
                <TableHead>Waktu</TableHead>
                <TableHead>Aktor</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((log) => {
                const fields = changedFields(log.diff);
                return (
                  <TableRow key={log.id}>
                    <TableCell className="tabular-nums whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">{log.actor_email || 'sistem'}</TableCell>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[log.action] || 'outline'}>
                        {ACTION_LABEL[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.entity}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entity_id ? shortId('ID', log.entity_id) : '-'}
                    </TableCell>
                    <TableCell>
                      {fields.length > 0 ? (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            {fields.length} field
                          </summary>
                          <dl className="mt-1 space-y-1">
                            {fields.map((f) => (
                              <div key={f}>
                                <dt className="font-mono text-muted-foreground">{f}</dt>
                                <dd className="tabular-nums">
                                  {fmtVal(log.diff?.old?.[f])} → {fmtVal(log.diff?.new?.[f])}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={History}
              title="Belum ada aktivitas"
              description="Tambah, ubah, atau hapus data untuk melihat jejaknya di sini."
            />
          )}
        </CardContent>
      </Card>
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/reports/activity" onPageChange={goToPage} />
    </div>
  );
}
