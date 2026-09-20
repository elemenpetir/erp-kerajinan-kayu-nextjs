import { ArrowLeft, Search } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getProductStockMap, getMaterialStockMap } from '../../../../lib/services/manufacturing';
import { docCode } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PrintButton from '@/components/ui/PrintButton';
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

function href(tab, status, q) {
  const p = new URLSearchParams({ tab, status });
  if (q) p.set('q', q);
  return `?${p.toString()}`;
}

export default async function StockReportPage({ searchParams }) {
  const sp = await searchParams;
  const tab = sp.tab === 'bahan' ? 'bahan' : 'produk';
  const status = sp.status === 'kritis' ? 'kritis' : 'semua';
  const q = String(sp.q || '').trim();

  const supabase = await createClient();
  const [{ data: produk }, { data: bahan }] = await Promise.all([
    supabase.from('produk').select('id,kode,nama').order('nama'),
    supabase.from('bahan').select('id,kode,nama').order('nama'),
  ]);
  const produkList = produk || [];
  const bahanList = bahan || [];
  const [stokP, stokB] = await Promise.all([
    getProductStockMap(supabase, produkList.map((p) => p.id)),
    getMaterialStockMap(supabase, bahanList.map((b) => b.id)),
  ]);
  const produkRows = produkList.map((p) => ({ ...p, _stok: stokP[p.id] ?? 0 }));
  const bahanRows = bahanList.map((b) => ({ ...b, _stok: stokB[b.id] ?? 0 }));
  const kritis = [...produkRows.filter((r) => r._stok <= 5), ...bahanRows.filter((r) => r._stok <= 10)].length;

  // Filter tampil: tab aktif + status + cari nama (server-side, URL bisa di-bookmark).
  const ambang = tab === 'produk' ? 5 : 10;
  const prefix = tab === 'produk' ? 'PRD' : 'BHN';
  const rows = (tab === 'produk' ? produkRows : bahanRows)
    .filter((r) => (status === 'kritis' ? r._stok <= ambang : true))
    .filter((r) => (q ? r.nama.toLowerCase().includes(q.toLowerCase()) : true));

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
            {produkRows.length} produk · {bahanRows.length} bahan · {kritis} menipis/habis
          </p>
        </div>
        <PrintButton />
      </div>
      <div className="no-print flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Tampil:</span>
        <Button variant={tab === 'produk' ? 'secondary' : 'ghost'} size="sm" asChild>
          <a href={href('produk', status, q)}>Produk ({produkRows.length})</a>
        </Button>
        <Button variant={tab === 'bahan' ? 'secondary' : 'ghost'} size="sm" asChild>
          <a href={href('bahan', status, q)}>Bahan ({bahanRows.length})</a>
        </Button>
        <span className="mx-2 h-6 w-px bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">Status:</span>
        <Button variant={status === 'semua' ? 'secondary' : 'ghost'} size="sm" asChild>
          <a href={href(tab, 'semua', q)}>Semua</a>
        </Button>
        <Button
          variant={status === 'kritis' ? 'secondary' : 'ghost'}
          size="sm"
          asChild
          className={status === 'kritis' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900' : ''}
        >
          <a href={href(tab, 'kritis', q)}>Menipis/Habis ({kritis})</a>
        </Button>
        <form method="get" action="/reports/stock" className="flex items-center gap-2">
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="status" value={status} />
          <Input name="q" defaultValue={q} placeholder="Cari nama..." className="h-8 w-44" />
          <Button type="submit" variant="outline" size="sm" aria-label="Cari">
            <Search />
          </Button>
        </form>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Stok {tab === 'produk' ? 'Produk' : 'Bahan'} · {rows.length} baris
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
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{docCode(prefix, r.kode, r.id)}</TableCell>
                  <TableCell className="font-medium">{r.nama}</TableCell>
                  <TableCell className={`text-right tabular-nums ${stokClass(r._stok, ambang)}`}>{r._stok}</TableCell>
                  <TableCell className={stokClass(r._stok, ambang)}>{stokLabel(r._stok, ambang)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Tidak ada baris yang cocok dengan filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
