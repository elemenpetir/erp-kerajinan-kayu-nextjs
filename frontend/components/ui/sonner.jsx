'use client';

import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';

function Toaster({ ...props }) {
  return (
    <Sonner
      theme="light"
      closeButton
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
        info: <Info className="h-4 w-4 text-blue-600" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
        error: <XCircle className="h-4 w-4 text-red-600" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg',
          title: 'group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-zinc-500',
          actionButton: 'group-[.toast]:bg-zinc-950 group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-600',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
