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
  // Same-origin only: reject absolute URLs and protocol-relative URLs
  // to prevent trusted post-login redirect to phishing sites.
  const rawNext = searchParams.get('next') || '';
  const next =
    rawNext.startsWith('/') && !rawNext.startsWith('//')
      ? rawNext
      : '/manufacturing/products';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function friendlyError(msg) {
    if (/already registered|already exists/i.test(msg)) return 'Email sudah terdaftar, silakan Masuk.';
    if (/invalid login credentials/i.test(msg)) return 'Email atau password salah.';
    if (/anonymous/i.test(msg)) return 'Isi email dan password terlebih dahulu.';
    if (/password.*(short|least|6)/i.test(msg)) return 'Password minimal 6 karakter.';
    if (/email not confirmed/i.test(msg)) return 'Email belum dikonfirmasi, hubungi admin.';
    if (/too many requests|rate limit|over_request/i.test(msg)) return 'Terlalu banyak percobaan, tunggu sebentar lalu coba lagi.';
    if (/fetch failed|network|Failed to fetch/i.test(msg)) return 'Gagal terhubung ke server, periksa koneksi.';
    return msg;
  }

  async function handleAuth() {
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
      // Signup publik dimatikan (invite-only); hanya login + demo.
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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

  // Demo account: public sacrificial credentials for portfolio visitors.
  // Hidden automatically when env is not set. See README / docs.
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || '';
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || '';
  const demoEnabled = demoEmail.length > 0 && demoPassword.length >= 6;

  async function handleDemo() {
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });
      if (error) throw error;
      router.push(next);
      router.refresh();
    } catch (e) {
      setMessage('Akun demo belum tersedia, hubungi admin.');
    } finally {
      setLoading(false);
    }
  }

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
        <Button disabled={loading || !formValid} onClick={handleAuth}>
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
        {demoEnabled && (
          <Button variant="secondary" disabled={loading} onClick={handleDemo}>
            Coba Demo Sekali Klik
          </Button>
        )}
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
