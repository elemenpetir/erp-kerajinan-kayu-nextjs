import { ArrowLeft } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getProductStockMap, getMaterialStockMap } from '../../../../lib/services/manufacturing';
import { docCode } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
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

export default async function StockReportPage() {
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stok Produk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produkRows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{docCode('PRD', p.kode, p.id)}</TableCell>
                  <TableCell className="font-medium">{p.nama}</TableCell>
                  <TableCell className={`text-right tabular-nums ${stokClass(p._stok, 5)}`}>{p._stok}</TableCell>
                  <TableCell className={stokClass(p._stok, 5)}>{stokLabel(p._stok, 5)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stok Bahan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bahanRows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{docCode('BHN', b.kode, b.id)}</TableCell>
                  <TableCell className="font-medium">{b.nama}</TableCell>
                  <TableCell className={`text-right tabular-nums ${stokClass(b._stok, 10)}`}>{b._stok}</TableCell>
                  <TableCell className={stokClass(b._stok, 10)}>{stokLabel(b._stok, 10)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
