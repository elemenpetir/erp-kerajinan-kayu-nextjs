import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login'];

export default async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
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
    },
  );

  // Aset statis tidak butuh sesi: lewatkan sebelum getUser (hemat + anti redirect nyasar)
  if (/\.(png|jpe?g|svg|ico|txt|xml|json|webmanifest|woff2?)$/.test(request.nextUrl.pathname)) {
    return response;
  }

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null; // Auth outage → diperlakukan sebagai anon (fail-closed di bawah)
  }

  // Normalisasi trailing slash agar '/login/' = '/login' (publik)
  const rawPath = request.nextUrl.pathname;
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  const isPublic = PUBLIC_PATHS.includes(path);

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
