'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

// File picker 1 field 2 warna: kiri fill secondary, kanan putih default.
// Native input disembunyikan (tidak bisa di-grid dengan andal),
// callback onSelect(file|null) ke pemanggil (upload tetap di sana).
export default function FilePicker({
  accept = 'image/*',
  onSelect,
  buttonLabel = 'Choose File',
  emptyLabel = 'No file chosen',
  className,
}) {
  const ref = useRef(null);
  const [name, setName] = useState('');

  function handleChange(e) {
    const f = e.target.files?.[0] || null;
    setName(f ? f.name : '');
    if (onSelect) onSelect(f);
  }

  function open() {
    ref.current?.click();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      className={cn('grid cursor-pointer grid-cols-2 overflow-hidden rounded-md border border-input text-sm', className)}
    >
      <span className="bg-secondary px-3 py-2 text-center font-medium text-secondary-foreground">
        {buttonLabel}
      </span>
      <span className="truncate px-3 py-2 text-muted-foreground" title={name || emptyLabel}>
        {name || emptyLabel}
      </span>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" aria-label={buttonLabel} />
    </div>
  );
}
