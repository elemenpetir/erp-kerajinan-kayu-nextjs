'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createCategory } from '../actions';

export default function CategoryForm() {
  const [nama, setNama] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          try {
            const fd = new FormData();
            fd.set('nama', nama);
            await createCategory(fd);
            setNama('');
            toast.success('Kategori ditambahkan');
          } catch (err) {
            toast.error(err.message);
          }
        });
      }}
    >
      <Input
        placeholder="Nama kategori"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
        className="max-w-xs"
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Menyimpan...' : 'Tambah Kategori'}
      </Button>
    </form>
  );
}
