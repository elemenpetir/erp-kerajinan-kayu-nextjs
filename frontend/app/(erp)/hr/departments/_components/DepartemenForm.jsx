'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ActionButton from '@/components/ui/ActionButton';
import { NativeSelect } from '@/components/ui/NativeSelect';
import { createDepartment, updateDepartmentManager, deleteDepartment } from '../actions';

export function CreateForm({ employees }) {
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          try {
            await createDepartment(new FormData(e.currentTarget));
            e.currentTarget.reset();
            toast.success("Departemen ditambahkan");
          } catch (err) {
            toast.error(err.message);
          }
        });
      }}
    >
      <Input name="nama_departemen" placeholder="Nama Departemen" required className="max-w-xs" />
      <NativeSelect name="manager" className="max-w-xs" defaultValue="">
        <option value="">— Pilih Manager —</option>
        {employees.map((k) => (
          <option key={k.id} value={k.nama}>
            {k.nama}
          </option>
        ))}
      </NativeSelect>
      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah"}
      </Button>
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
      <NativeSelect value={manager} onChange={(e) => setManager(e.target.value)}>
        <option value="">— Kosongkan —</option>
        {employees.map((k) => (
          <option key={k.id} value={k.nama}>
            {k.nama}
          </option>
        ))}
      </NativeSelect>
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
      <Button variant="ghost" size="sm" onClick={() => { setManager(dept.manager || ''); setEditing(false); }}>
        Batal
      </Button>
    </div>
  );
}
