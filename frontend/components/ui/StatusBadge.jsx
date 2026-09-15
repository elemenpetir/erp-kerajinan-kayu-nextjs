import { Badge } from '@/components/ui/badge';

// Single source of truth for status colors across all modules.
// Neutral base; color only carries state meaning (anti-slop).
const MAP = {
  // done / paid
  Paid: 'success',
  'Fully Invoice': 'success',
  Selesai: 'success',
  'Sales Order': 'success',
  Terkirim: 'success',
  // in progress
  Bill: 'warning',
  'To Invoice': 'warning',
  Konfirmasi: 'warning',
  'Dalam Proses': 'warning',
};

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-muted-foreground">-</span>;
  return <Badge variant={MAP[status] || 'secondary'}>{status}</Badge>;
}
