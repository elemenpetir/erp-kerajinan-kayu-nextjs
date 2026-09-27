'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { docCode, formatRupiah } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PrintButton from '@/components/ui/PrintButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Omzet = total_biaya sales_order (invoice/pembayaran masuk Batch 4 keuangan).
export default function SalesReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const q = (searchParams.get('q') || '').trim();

  const { data, error, isLoading, mutate } = useList('sales-report', { from, to, q });

  function applyFilters(newParams) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh();
    mutate();
  }

  const rows = data?.rows || [];
  const omzet = rows.reduce((s, o) => s + Number(o.total_biaya || 0), 0);
  const rata = rows.length ? omzet / rows.length : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="no-print">
            <Link href="/" aria-label="Kembali">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Laporan Penjualan</h1>
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
          <PrintButton />
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

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          nav, aside, .no-print { display: none !important; }
          body { background: white !important; }
          button, a { display: none !important; }
          main { overflow: visible !important; }
          ::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; }
        }
      `}</style>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="no-print">
          <Link href="/" aria-label="Kembali">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Laporan Penjualan</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} transaksi{from || to ? ` · ${from || '…'} – ${to || '…'}` : ' · semua periode'}
          </p>
        </div>
        <PrintButton />
      </div>
      <form
        key={`${from}|${to}|${q}`}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          applyFilters({ from: fd.get('from') || '', to: fd.get('to') || '', q: fd.get('q') || '' });
        }}
        className="no-print flex flex-wrap items-end gap-2"
      >
        <div className="grid gap-1">
          <Label htmlFor="from">Dari</Label>
          <Input id="from" name="from" type="date" defaultValue={from} className="h-8" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="to">Sampai</Label>
          <Input id="to" name="to" type="date" defaultValue={to} className="h-8" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="q">Customer</Label>
          <Input id="q" name="q" defaultValue={q} placeholder="Cari nama..." className="h-8 w-44" />
        </div>
        <Button type="submit" variant="secondary" size="sm" aria-label="Terapkan filter">
          <Search />
          Terapkan
        </Button>
        {(from || to || q) && (
          <Button variant="ghost" size="sm" onClick={() => applyFilters({ from: '', to: '', q: '' })}>
            Reset
          </Button>
        )}
      </form>
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total omzet</p>
            <p className="text-lg font-semibold tabular-nums">{formatRupiah(omzet)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Transaksi</p>
            <p className="text-lg font-semibold tabular-nums">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Rata-rata</p>
            <p className="text-lg font-semibold tabular-nums">{formatRupiah(rata)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaksi · {rows.length} baris</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nomor</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="tabular-nums">
                    {new Date(o.created_at).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{docCode('SO', o.kode, o.id)}</TableCell>
                  <TableCell className="font-medium">{o.customer_snapshot?.nama || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(o.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Tidak ada transaksi pada periode ini.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
