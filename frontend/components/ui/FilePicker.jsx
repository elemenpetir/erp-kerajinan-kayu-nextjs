'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// File picker 2 kolom: tombol secondary + nama file.
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

  return (
    <div className={cn('grid grid-cols-2 items-center gap-3', className)}>
      <Button type="button" variant="secondary" onClick={() => ref.current?.click()}>
        {buttonLabel}
      </Button>
      <span className="truncate text-sm text-muted-foreground" title={name || emptyLabel}>
        {name || emptyLabel}
      </span>
      <input ref={ref} type="file" accept={accept} onChange={handleChange} className="hidden" aria-label={buttonLabel} />
    </div>
  );
}
