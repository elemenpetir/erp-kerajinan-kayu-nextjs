import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/', '/login'];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];
const SESSION_COOKIE = `sb-${PROJECT_REF}-auth-token`;

// JWKS di-cache per isolate (kunci publik jarang berganti) — verifikasi JWT
// lokal tanpa round trip ke auth server tiap navigasi.
let jwksPromise = null;
function getJwks() {
  if (!jwksPromise) {
    jwksPromise = createRemoteJWKSet(
      new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwksPromise;
}

// Cookie sesi Supabase: satu cookie, atau chunked (.0, .1, ...) bila >~3KB.
function readSessionCookie(request) {
  const all = request.cookies.getAll();
  const direct = all.find((c) => c.name === SESSION_COOKIE);
  if (direct) return direct.value;
  const chunks = all.filter((c) => c.name.startsWith(`${SESSION_COOKIE}.`));
  if (!chunks.length) return null;
  chunks.sort((a, b) => Number(a.name.split('.').pop()) - Number(b.name.split('.').pop()));
  return chunks.map((c) => c.value).join('');
}

// true = signature valid + belum expired. false = gagal (expired/forged/rusak)
// → jalur fallback getUser() di bawah yang menentukan nasibnya.
async function verifySessionLocally(rawSession) {
  try {
    const session = JSON.parse(rawSession);
    if (!session?.access_token) return false;
    await jwtVerify(session.access_token, await getJwks());
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(request) {
  let response = NextResponse.next({ request });

  // Aset statis tidak butuh sesi: lewatkan sebelum verifikasi (hemat + anti redirect nyasar)
  if (/\.(png|jpe?g|svg|ico|txt|xml|json|webmanifest|woff2?)$/.test(request.nextUrl.pathname)) {
    return response;
  }

  // Normalisasi trailing slash agar '/login/' = '/login' (publik)
  const rawPath = request.nextUrl.pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const isPublic = PUBLIC_PATHS.includes(path);

  let user = null;
  const rawSession = readSessionCookie(request);

  if (!rawSession) {
    // Tanpa cookie → anon, tanpa network.
    user = null;
  } else if (await verifySessionLocally(rawSession)) {
    // JWT valid (signature JWKS + expiry) → lolos gerbang tanpa network.
    user = true;
  } else {
    // Expired/forged/rusak → jalur lama: validasi + auto-refresh di server Supabase.
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null; // Auth outage → diperlakukan sebagai anon (fail-closed di bawah)
    }
  }

  // ponytail: satu-satunya pintu auth; halaman guard via redirect, data via RLS
  if (!user && !isPublic) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.searchParams.set('next', path);
    return NextResponse.redirect(login);
  }
  if (user && path === '/login') {
    const home = request.nextUrl.clone();
    home.pathname = '/';
    home.searchParams.delete('next');
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
