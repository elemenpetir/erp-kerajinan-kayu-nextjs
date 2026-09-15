'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/manufacturing/products';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function friendlyError(msg) {
    if (/already registered|already exists/i.test(msg)) return 'Email sudah terdaftar, silakan Masuk.';
    if (/invalid login credentials/i.test(msg)) return 'Email atau password salah.';
    if (/anonymous/i.test(msg)) return 'Isi email dan password terlebih dahulu.';
    if (/password.*(short|least|6)/i.test(msg)) return 'Password minimal 6 karakter.';
    return msg;
  }

  async function handleAuth(mode) {
    setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Isi email yang valid.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password minimal 6 karakter.');
      return;
    }
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
      setMessage(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  }

  const formValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6;

  return (
    <Card style={{ width: 360, maxWidth: '100%' }}>
      <CardHeader>
        <CardTitle>Masuk ERP</CardTitle>
        <CardDescription>Gunakan akun email yang terdaftar di Supabase Auth.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 pt-0">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {message && <span className="text-sm text-destructive">{message}</span>}
        <Button disabled={loading || !formValid} onClick={() => handleAuth('in')}>
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
        <Button variant="outline" disabled={loading || !formValid} onClick={() => handleAuth('up')}>
          Daftar akun baru
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
