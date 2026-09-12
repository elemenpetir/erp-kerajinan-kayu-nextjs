'use client';

import { useTransition } from 'react';

// Generic row action island: server action (optionally .bind with args)
// is passed as `run` prop — supported Next.js pattern.
export default function ActionButton({ run, confirmText, successText, label, className }) {
  const [pending, start] = useTransition();
  return (
    <button
      className={className}
      disabled={pending}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        start(async () => {
          try {
            await run();
            if (successText) alert(successText);
          } catch (e) {
            alert('Gagal: ' + e.message);
          }
        });
      }}
    >
      {pending ? '...' : label}
    </button>
  );
}
