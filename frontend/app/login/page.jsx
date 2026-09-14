'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(mode) {
    setMessage('');
    setLoading(true);
    try {
      const { error } =
        mode === 'in'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="detail-card" style={{ width: 360, maxWidth: '100%' }}>
      <h2>Masuk ERP</h2>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
        Gunakan akun email yang terdaftar di Supabase Auth.
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {message && <span style={{ color: '#dc2626', fontSize: 14 }}>{message}</span>}
        <button className="btn mb-0" disabled={loading} onClick={() => handleAuth('in')}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
        <button className="btn-outline mb-0" disabled={loading} onClick={() => handleAuth('up')}>
          Daftar akun baru
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 16 }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
