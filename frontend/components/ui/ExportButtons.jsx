'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toCsv, downloadCsv, stampName } from '@/lib/exportCsv';

// Tombol ekspor seragam. Dua mode data:
// - entity (+q opsional): fetch /api/lists/{entity}?q=&limit=2000 (full filtered set).
// - rows (+extra): dataset langsung dari props (untuk laporan).
// columns = [{ header, get(row, index) }]; footer({ items, extra }) -> baris array | null.
// jspdf di-dynamic-import saat klik agar tak masuk bundle awal.
export default function ExportButtons({
  entity = null,
  q = '',
  rows = null,
  extra = {},
  columns,
  filename,
  formats = ['csv'],
  pdfTitle = '',
  pdfSubtitle = '',
  footer = null,
}) {
  const [busy, setBusy] = useState(false);

  async function dataset() {
    if (rows) return { items: rows, extra };
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    params.set('limit', '2000');
    const res = await fetch(`/api/lists/${entity}?${params.toString()}`);
    if (!res.ok) throw new Error('Gagal mengambil data');
    const json = await res.json();
    return { items: json.items || json.rows || [], extra: json };
  }

  function shape(data) {
    const body = data.items.map((r, i) => columns.map((c) => c.get(r, i)));
    const foot = footer ? footer(data) : null;
    return { body, foot, headers: columns.map((c) => c.header) };
  }

  async function doCsv() {
    setBusy(true);
    try {
      const data = await dataset();
      const { body, foot, headers } = shape(data);
      if (foot) body.push(foot);
      downloadCsv(stampName(filename, 'csv'), toCsv(headers, body));
      toast.success('CSV diunduh');
    } catch (e) {
      toast.error('Gagal: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  async function doPdf() {
    setBusy(true);
    try {
      const data = await dataset();
      const { body, foot, headers } = shape(data);
      const { buildPdf, downloadPdf } = await import('@/lib/exportPdf');
      const subtitle = typeof pdfSubtitle === 'function' ? pdfSubtitle(data) : pdfSubtitle;
      const doc = buildPdf({ title: pdfTitle, subtitle, headers, rows: body, footer: foot });
      downloadPdf(doc, stampName(filename, 'pdf'));
      toast.success('PDF diunduh');
    } catch (e) {
      toast.error('Gagal: ' + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {formats.includes('csv') && (
        <Button variant="outline" size="sm" onClick={doCsv} disabled={busy} aria-label="Unduh CSV">
          {busy ? <Loader2 className="animate-spin" /> : <FileDown />}
          CSV
        </Button>
      )}
      {formats.includes('pdf') && (
        <Button variant="outline" size="sm" onClick={doPdf} disabled={busy} aria-label="Unduh PDF">
          {busy ? <Loader2 className="animate-spin" /> : <FileText />}
          PDF
        </Button>
      )}
    </div>
  );
}
