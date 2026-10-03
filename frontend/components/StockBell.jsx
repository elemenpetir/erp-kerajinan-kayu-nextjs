'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { useList } from '@/hooks/useList';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Bell stok kritis: angka polling tiap 60 detik, klik ke laporan terfilter,
// toast SEKALI per mount bila ada yang habis (layout persist = sekali per login).
export default function StockBell() {
  const { data } = useList('stock-report', {}, { refreshInterval: 60000 });
  const kritis = data?.kritis || 0;
  const habis = data?.habis || 0;
  const shown = useRef(false);

  useEffect(() => {
    if (habis > 0 && !shown.current) {
      shown.current = true;
      toast.warning(`Ada ${habis} produk/bahan yang habis. Cek Laporan Stok.`);
    }
  }, [habis]);

  if (!data || kritis === 0) return null;

  return (
    <Button variant="ghost" size="icon" asChild aria-label={`${kritis} stok kritis`}>
      <Link href="/reports/stock?status=kritis" className="relative">
        <Bell />
        <Badge
          variant={habis > 0 ? 'destructive' : 'secondary'}
          className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center px-1 text-[11px] tabular-nums"
        >
          {kritis}
        </Badge>
      </Link>
    </Button>
  );
}
