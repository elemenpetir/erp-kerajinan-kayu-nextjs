'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRole } from '@/hooks/useRole';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from '@/components/ui/EmptyState';
import { NativeSelect } from '@/components/ui/NativeSelect';

const ROLES = ['admin', 'manager', 'staff'];

async function fetcher(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error('Gagal memuat data');
    err.status = res.status;
    try {
      const j = await res.json();
      if (j?.error) err.message = j.error;
    } catch { /* abaikan */ }
    throw err;
  }
  return res.json();
}

function fmtDate(v) {
  if (!v) return '-';
  return new Date(v).toLocaleString('id-ID');
}

export default function RolesPage() {
  const { role } = useRole();
  const [me, setMe] = useState(null);
  const { data, error, isLoading, mutate } = useSWR(role === 'admin' ? '/api/admin/users' : null, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user || null));
  }, []);

  async function setRole(id, newRole) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Gagal menyimpan');
      toast.success('Role diperbarui (berlaku saat user login ulang)');
      mutate();
    } catch (e) {
      toast.error('Gagal: ' + e.message);
      mutate();
    }
  }

  if (role !== 'admin') {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Peran Pengguna</h1>
          <p className="text-sm text-muted-foreground">Kelola role admin, manager, dan staff.</p>
        </div>
        <Card>
          <CardContent className="flex items-center gap-3 py-8">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Akses ditolak. Halaman ini hanya untuk Admin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Peran Pengguna</h1>
          <p className="text-sm text-muted-foreground">Kelola role admin, manager, dan staff.</p>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Gagal memuat data: {error.message}</p>
        <Button onClick={() => mutate()}>Coba Lagi</Button>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Peran Pengguna</h1>
        <p className="text-sm text-muted-foreground">
          Kelola role admin, manager, dan staff. Berlaku saat user login ulang.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Login Terakhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.email || '-'}
                    {me && u.id === me.id && (
                      <Badge variant="outline" className="ml-2">
                        Anda
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {me && u.id === me.id ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        {u.role}
                      </span>
                    ) : (
                      <NativeSelect
                        value={u.role}
                        onChange={(e) => setRole(u.id, e.target.value)}
                        aria-label={`Role ${u.email}`}
                        className="h-8 w-36"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </NativeSelect>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{fmtDate(u.created_at)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{fmtDate(u.last_sign_in_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {items.length === 0 && (
            <EmptyState
              icon={ShieldCheck}
              title="Belum ada user"
              description="User muncul setelah mendaftar."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
