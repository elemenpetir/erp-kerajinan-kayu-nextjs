'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Generic row action island: server action (optionally .bind with args)
// is passed as `run` prop. Confirm via accessible dialog (no confirm()),
// feedback via toast (no alert()).
export default function ActionButton({
  run,
  confirmTitle = 'Yakin?',
  confirmText,
  successText,
  onSuccess,
  label,
  className,
  variant,
  size = 'sm',
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function execute() {
    start(async () => {
      try {
        await run();
        setOpen(false);
        if (successText) toast.success(successText);
        if (onSuccess) onSuccess();
      } catch (e) {
        toast.error('Gagal: ' + e.message);
      }
    });
  }

  const trigger = (
    <Button
      variant={variant || 'outline'}
      size={size}
      className={className}
      disabled={pending}
      onClick={() => (confirmText ? setOpen(true) : execute())}
    >
      {pending ? 'Memproses...' : label}
    </Button>
  );

  if (!confirmText) return trigger;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmText}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={(e) => { e.preventDefault(); execute(); }}>
            {pending ? 'Memproses...' : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
