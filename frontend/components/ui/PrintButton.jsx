'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Tombol print client (pola @media print seperti bills/[id]).
// Dipakai halaman server (laporan) yang tidak bisa onClick langsung.
export default function PrintButton({ label = 'Print' }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
      <Printer />
      {label}
    </Button>
  );
}
