'use client';

import { Toaster as Sonner } from 'sonner';

function Toaster({ ...props }) {
  return (
    <Sonner
      theme="light"
      closeButton
      className="toaster group"
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
