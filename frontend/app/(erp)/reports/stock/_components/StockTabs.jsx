'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tab jenis stok (Produk|Bahan) pola shadcn, tetap URL-driven:
// pindah tab = navigasi (filter + bookmark ikut seperti sebelumnya).
export default function StockTabs({ tab, status, q, produkCount, bahanCount }) {
  function go(v) {
    const p = new URLSearchParams({ tab: v, status });
    if (q) p.set('q', q);
    window.location.href = `?${p.toString()}`;
  }
  return (
    <Tabs value={tab} onValueChange={go} aria-label="Jenis stok">
      <TabsList>
        <TabsTrigger value="produk">Produk ({produkCount})</TabsTrigger>
        <TabsTrigger value="bahan">Bahan ({bahanCount})</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
