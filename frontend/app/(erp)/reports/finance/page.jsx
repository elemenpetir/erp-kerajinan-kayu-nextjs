import { ArrowLeft } from 'lucide-react';
import { createClient } from '../../../../lib/supabase/server';
import { getCustomerInvoicesTotal, getVendorBillsTotal } from '../../../../lib/services/accounting';
import { docCode, formatRupiah } from '../../../../lib/utils/format';
import { Button } from '@/components/ui/button';
import PrintButton from '@/components/ui/PrintButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const dynamic = 'force-dynamic';

// Posisi keuangan saat ini (tanpa filter periode, seperti stok):
// piutang = SO belum Fully Invoice, utang = bill berstatus Bill,
// diterima/dibayar = agregat RPC (aktual kas masuk/keluar).
export default async function FinanceReportPage() {
  const supabase = await createClient();
  const [{ data: so }, { data: bills }, diterima, dibayar] = await Promise.all([
    supabase
      .from('sales_order')
      .select('id,kode,customer_snapshot,total_biaya,status,created_at')
      .neq('status', 'Fully Invoice')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false }),
    supabase
      .from('bills')
      .select('id,kode,referensi_vendor,deadline_order,total_biaya,status,created_at')
      .eq('status', 'Bill')
      .order('deadline_order', { ascending: true })
      .order('id', { ascending: false }),
    getCustomerInvoicesTotal(supabase),
    getVendorBillsTotal(supabase),
  ]);
  const piutangRows = so || [];
  const utangRows = bills || [];
  const piutang = piutangRows.reduce((s, o) => s + Number(o.total_biaya || 0), 0);
  const utang = utangRows.reduce((s, b) => s + Number(b.total_biaya || 0), 0);
  const bersih = diterima - dibayar;

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
          <h1 className="text-lg font-semibold">Laporan Keuangan</h1>
          <p className="text-sm text-muted-foreground">
            Kas bersih {formatRupiah(bersih)} (diterima − dibayar)
          </p>
        </div>
        <PrintButton />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Piutang (belum invoice)</p>
            <p className="text-lg font-semibold tabular-nums text-amber-600">{formatRupiah(piutang)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Diterima (invoice)</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatRupiah(diterima)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Utang (belum bayar)</p>
            <p className="text-lg font-semibold tabular-nums text-destructive">{formatRupiah(utang)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Dibayar (vendor)</p>
            <p className="text-lg font-semibold tabular-nums">{formatRupiah(dibayar)}</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rincian Piutang · {piutangRows.length} baris</CardTitle>
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
              {piutangRows.map((o) => (
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
          {piutangRows.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Tidak ada piutang terbuka.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rincian Utang · {utangRows.length} baris</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead>Referensi Vendor</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utangRows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.referensi_vendor || docCode('BLL', b.kode, b.id)}</TableCell>
                  <TableCell className="tabular-nums">
                    {b.deadline_order ? new Date(b.deadline_order).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(b.total_biaya || 0).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {utangRows.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">Tidak ada utang terbuka.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
