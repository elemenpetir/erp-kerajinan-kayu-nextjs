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

// Aksi baris pola shadcn (trigger ⋯ + DropdownMenu).
// Dialog konfirmasi tetap milik ActionButton (mode controlled) —
// menu hanya pemicu, keputusan destructif tetap di dialog.
// actions: [{ label, run, confirmTitle, confirmText, successText, variant }]
// onSuccess: dipanggil setelah aksi sukses (mis. mutate() SWR di list client)
export default function RowActions({ viewHref = null, viewLabel = 'Lihat', actions = [], onSuccess = null }) {
  const [dlg, setDlg] = useState(null);

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
          {actions.map((a, i) => (
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
      {actions.map((a, i) => (
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
