'use client';

import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Satu-satunya form search list: key remount agar Reset mengosongkan input,
// tombol jadi spinner + disabled saat busy, Reset hanya bila q aktif.
// compact = varian toolbar (input pendek + tombol ikon).
export default function SearchForm({ q = '', onSearch, placeholder = 'Cari...', busy = false, compact = false }) {
  return (
    <form
      key={q}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSearch({ q: fd.get('q') || '' });
      }}
      className={compact ? 'flex items-center gap-2' : 'flex flex-wrap items-end gap-2'}
    >
      <Input
        id="q"
        name="q"
        aria-label="Cari"
        defaultValue={q}
        placeholder={placeholder}
        className={compact ? 'h-8 w-44' : 'h-8 w-64'}
      />
      <Button type="submit" variant="secondary" size="sm" aria-label="Cari" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <Search />}
        {!compact && 'Cari'}
      </Button>
      {q && (
        <Button variant="ghost" size="sm" onClick={() => onSearch({ q: '' })}>
          Reset
        </Button>
      )}
    </form>
  );
}
