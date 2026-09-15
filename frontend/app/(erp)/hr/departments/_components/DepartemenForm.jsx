'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ActionButton from '@/components/ui/ActionButton';
import { createDepartment, updateDepartmentManager, deleteDepartment } from '../actions';

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

export function CreateForm({ employees }) {
  return (
    <form action={createDepartment} className="flex flex-wrap items-center gap-2">
      <Input name="nama_departemen" placeholder="Nama Departemen" required className="max-w-xs" />
      <select name="manager" className={`${selectClass} max-w-xs`} defaultValue="">
        <option value="">— Pilih Manager —</option>
        {employees.map((k) => (
          <option key={k.id} value={k.nama}>
            {k.nama}
          </option>
        ))}
      </select>
      <Button type="submit">Tambah</Button>
    </form>
  );
}

export function RowActions({ dept, employees }) {
  const [editing, setEditing] = useState(false);
  const [manager, setManager] = useState(dept.manager || '');
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit Manager
        </Button>
        <ActionButton
          run={deleteDepartment.bind(null, dept.id)}
          confirmTitle="Hapus departemen?"
          confirmText="Hapus departemen ini?"
          label="Hapus"
          variant="destructive"
        />
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <select value={manager} onChange={(e) => setManager(e.target.value)} className={selectClass}>
        <option value="">— Kosongkan —</option>
        {employees.map((k) => (
          <option key={k.id} value={k.nama}>
            {k.nama}
          </option>
        ))}
      </select>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await updateDepartmentManager(dept.id, manager);
              setEditing(false);
            } catch (e) {
              toast.error('Gagal update: ' + e.message);
            }
          })
        }
      >
        Simpan
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
        Batal
      </Button>
    </div>
  );
}
