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
          toast: 'group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-white group-[.toaster]:border-zinc-800',
          description: 'group-[.toast]:text-zinc-400',
          actionButton: 'group-[.toast]:bg-white group-[.toast]:text-zinc-950',
          cancelButton: 'group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
