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
          toast: 'bg-zinc-950 text-white border-zinc-800',
          description: 'text-zinc-400',
          actionButton: 'bg-white text-zinc-950',
          cancelButton: 'bg-zinc-800 text-zinc-400',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
