import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ROLES = ['admin', 'manager', 'staff'];

// Gate wajib: hanya admin. Tanpa ini = lubang eskalasi (semua user login bisa set role).
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if ((user?.app_metadata?.role || 'staff') !== 'admin') return null;
  return user;
}

function pick(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.app_metadata?.role || 'staff',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  };
}

export async function GET() {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data.users || []).map(pick) });
}

export async function PATCH(req) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });

  const { id, role } = await req.json();
  if (!id || !ROLES.includes(role)) {
    return NextResponse.json({ error: 'Permintaan tidak valid' }, { status: 400 });
  }
  if (id === me.id && role !== 'admin') {
    return NextResponse.json({ error: 'Tidak bisa demosi diri sendiri' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: list, error: listError } = await admin.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
  const users = list.users || [];
  const target = users.find((u) => u.id === id);
  if (!target) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  const oldRole = target.app_metadata?.role || 'staff';
  const adminCount = users.filter((u) => (u.app_metadata?.role || 'staff') === 'admin').length;
  if (oldRole === 'admin' && role !== 'admin' && adminCount <= 1) {
    return NextResponse.json({ error: 'Tidak bisa: ini admin terakhir' }, { status: 400 });
  }

  const { data, error } = await admin.auth.admin.updateUserById(id, {
    app_metadata: { ...(target.app_metadata || {}), role },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit eksplisit (trigger DB tak cover auth.users).
  await admin.from('audit_log').insert({
    actor_id: me.id,
    actor_email: me.email,
    action: 'UPDATE',
    entity: 'user_role',
    entity_id: id,
    diff: { old: { role: oldRole }, new: { role } },
  });

  return NextResponse.json({ item: pick(data.user) });
}
