'use client';

import { useState, useTransition } from 'react';
import { createDepartment, updateDepartmentManager, deleteDepartment } from '../actions';

export function CreateForm({ employees }) {
  return (
    <form action={createDepartment} style={{ marginBottom: 12 }}>
      <input name="nama_departemen" placeholder="Nama Departemen" required />
      <select name="manager" style={{ marginLeft: 8 }} defaultValue="">
        <option value="">— Pilih Manager —</option>
        {employees.map((k) => (
          <option key={k.id} value={k.nama}>
            {k.nama}
          </option>
        ))}
      </select>
      <button className="btn mb-0" style={{ marginLeft: 8 }}>
        Tambah
      </button>
    </form>
  );
}

export function RowActions({ dept, employees }) {
  const [editing, setEditing] = useState(false);
  const [manager, setManager] = useState(dept.manager || '');
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <div className="action-buttons">
        <button className="btn-table-action" onClick={() => setEditing(true)}>
          Edit Manager
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (!confirm('Hapus departemen ini?')) return;
            start(async () => {
              try {
                await deleteDepartment(dept.id);
              } catch (e) {
                alert('Gagal hapus: ' + e.message);
              }
            });
          }}
        >
          {pending ? '...' : 'Hapus'}
        </button>
      </div>
    );
  }

  return (
    <div className="action-buttons">
      <select value={manager} onChange={(e) => setManager(e.target.value)}>
        <option value="">— Kosongkan —</option>
        {employees.map((k) => (
          <option key={k.id} value={k.nama}>
            {k.nama}
          </option>
        ))}
      </select>
      <button
        className="btn-table-action"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              await updateDepartmentManager(dept.id, manager);
              setEditing(false);
            } catch (e) {
              alert('Gagal update: ' + e.message);
            }
          })
        }
      >
        Simpan
      </button>
      <button className="btn-table-action" onClick={() => setEditing(false)}>
        Batal
      </button>
    </div>
  );
}
