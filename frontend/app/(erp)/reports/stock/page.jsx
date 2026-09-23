'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useStock } from '@/hooks/useStock';
import { ArrowLeft, Search } from 'lucide-react';
import { docCode } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PrintButton from '@/components/ui/PrintButton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

// Ambang "menipis" sama seperti grid (produk ≤5, bahan ≤10).
function stokClass(stok, ambang) {
  if (stok <= 0) return 'font-semibold text-destructive';
  if (stok <= ambang) return 'font-semibold text-amber-600';
  return 'font-semibold text-emerald-600';
}

function stokLabel(stok, ambang) {
  if (stok <= 0) return 'Habis';
  if (stok <= ambang) return 'Menipis';
  return 'Aman';
}

function prefixForTab(tab) {
  return tab === 'produk' ? 'PRD' : 'BHN';
}

function StockReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') === 'bahan' ? 'bahan' : 'produk';
  const status = searchParams.get('status') === 'kritis' ? 'kritis' : 'semua';
  const q = (searchParams.get('q') || '').trim();

  const {
    data: items,
    produkCount,
    bahanCount,
    kritis,
    error,
    isLoading,
    mutate,
  } = useStock({ tab, status, q });

  // Handle filter changes with pushState
  function applyFilters(newParams) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh(); // triggers SWR re-fetch via key change
    mutate(); // also trigger local re-fetch
  }

  function goToPage(newPage) {
    // Not used for stock report (no pagination)
  }

  if (isLoading) {
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
            <a href="/" aria-label="Kembali">
              <ArrowLeft />
            </a>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Laporan Stok</h1>
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

  const ambang = tab === 'produk' ? 5 : 10;
  const prefix = prefixForTab(tab);

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
          <a href="/" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Laporan Stok</h1>
          <p className="text-sm text-muted-foreground">
            {produkCount} produk · {bahanCount} bahan · {kritis} menipis/habis
          </p>
        </div>
        <PrintButton />
      </div>
      <div className="no-print flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Tampil:</span>
        <Tabs value={tab} onValueChange={(v) => applyFilters({ tab: v })} aria-label="Jenis stok">
          <TabsList>
            <TabsTrigger value="produk">Produk ({produkCount})</TabsTrigger>
            <TabsTrigger value="bahan">Bahan ({bahanCount})</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="mx-2 h-6 w-px bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">Status:</span>
        <button
          onClick={() => applyFilters({ status: 'semua' })}
          className={`px-3 py-1.5 text-sm rounded-md border ${status === 'semua' ? 'bg-secondary text-secondary-foreground' : 'bg-transparent hover:bg-accent'}`}
        >
          Semua
        </button>
        <button
          onClick={() => applyFilters({ status: 'kritis' })}
          className={`px-3 py-1.5 text-sm rounded-md border ${status === 'kritis' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-transparent hover:bg-accent'}`}
        >
          Menipis/Habis ({kritis})
        </button>
        <form onSubmit={(e) => { e.preventDefault(); applyFilters({ q: e.currentTarget.q.value }); }} className="flex items-center gap-2">
          <Input name="q" value={q} placeholder="Cari nama..." className="h-8 w-44" />
          <Button type="submit" variant="outline" size="sm" aria-label="Cari">
            <Search />
          </Button>
        </form>
        {(status !== 'semua' || q) && (
          <Button variant="ghost" size="sm" onClick={() => { applyFilters({ tab: 'produk', status: 'semua', q: '' }); }}>
            Reset
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Stok {tab === 'produk' ? 'Produk' : 'Bahan'} · {items.length} baris
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{docCode(prefix, r.kode, r.id)}</TableCell>
                  <TableCell className="font-medium">{r.nama}</TableCell>
                  <TableCell className={`text-right tabular-nums ${stokClass(r._stok, ambang)}`}>{r._stok}</TableCell>
                  <TableCell className={stokClass(r._stok, ambang)}>{stokLabel(r._stok, ambang)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Tidak ada baris yang cocok dengan filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StockReportPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button className="p-2" disabled><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Laporan Stok</h1>
            <p className="text-sm text-muted-foreground">Memuat...</p>
          </div>
          <button className="px-3 py-1.5 text-sm" disabled><Search className="h-4 w-4" /> Print</button>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted rounded" />
          ))}
        </div>
      </div>
    }>
      <StockReportContent />
    </Suspense>
  );
}