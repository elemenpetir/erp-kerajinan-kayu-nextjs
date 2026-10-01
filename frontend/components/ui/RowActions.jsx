'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ActionButton from '@/components/ui/ActionButton';
import { useRole } from '@/hooks/useRole';
import { can } from '@/lib/permissions';

// Aksi baris pola shadcn (trigger ⋯ + DropdownMenu).
// Dialog konfirmasi tetap milik ActionButton (mode controlled) —
// menu hanya pemicu, keputusan destructif tetap di dialog.
// actions: [{ label, run, confirmTitle, confirmText, successText, variant }]
// onSuccess: dipanggil setelah aksi sukses (mis. mutate() SWR di list client)
// entity: kunci halaman untuk matriks izin; manager = hanya Lihat,
//   staff di entitas master/finance = tanpa Hapus (enforcement riil tetap di RLS).
export default function RowActions({ viewHref = null, viewLabel = 'Lihat', actions = [], onSuccess = null, entity = null }) {
  const [dlg, setDlg] = useState(null);
  const { role } = useRole();

  const visible = actions.filter((a) => {
    if (!can(role, 'update', entity)) return false;
    if (a.label === 'Hapus' && !can(role, 'delete', entity)) return false;
    return true;
  });

  if (!viewHref && visible.length === 0) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Aksi baris">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {viewHref && (
            <DropdownMenuItem asChild>
              <Link href={viewHref}>{viewLabel}</Link>
            </DropdownMenuItem>
          )}
          {visible.map((a, i) => (
            <DropdownMenuItem
              key={a.label}
              onSelect={() => setDlg(i)}
              className={a.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}
            >
              {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {visible.map((a, i) => (
        <ActionButton
          key={a.label}
          run={a.run}
          confirmTitle={a.confirmTitle}
          confirmText={a.confirmText}
          successText={a.successText}
          label={a.label}
          variant={a.variant}
          onSuccess={a.onSuccess ?? onSuccess ?? undefined}
          hideTrigger
          open={dlg === i}
          onOpenChange={(v) => setDlg(v ? i : null)}
        />
      ))}
    </>
  );
}
