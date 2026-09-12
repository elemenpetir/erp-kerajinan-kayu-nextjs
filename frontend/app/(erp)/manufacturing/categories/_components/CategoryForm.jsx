'use client';

import { useState, useTransition } from 'react';
import { createCategory } from '../actions';

export default function CategoryForm() {
  const [nama, setNama] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
      onSubmit={(e) => {
        e.preventDefault();
        setMessage('');
        start(async () => {
          try {
            const fd = new FormData();
            fd.set('nama', nama);
            await createCategory(fd);
            setNama('');
          } catch (err) {
            setMessage(err.message);
          }
        });
      }}
    >
      <input
        className="form-input"
        placeholder="Nama kategori"
        value={nama}
        onChange={(e) => {
          setNama(e.target.value);
          setMessage('');
        }}
        required
        style={{ height: '42px' }}
      />
      <button className="btn mb-0" type="submit" disabled={pending}>
        {pending ? 'Menyimpan...' : 'Tambah Kategori'}
      </button>
      {message && <span style={{ color: '#dc2626', fontSize: 14 }}>{message}</span>}
    </form>
  );
}
