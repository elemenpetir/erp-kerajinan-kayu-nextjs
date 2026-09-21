'use client';

import { useState } from 'react';
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
export default function RowActions({ viewHref = null, viewLabel = 'Lihat', actions = [] }) {
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
              <a href={viewHref}>{viewLabel}</a>
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
          hideTrigger
          open={dlg === i}
          onOpenChange={(v) => setDlg(v ? i : null)}
        />
      ))}
    </>
  );
}
