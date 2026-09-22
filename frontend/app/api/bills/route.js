import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBillsPage, PAGE_SIZE } from '@/lib/services/purchase';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const supabase = await createClient();
    const { items, count, page: safePage } = await getBillsPage(supabase, { page });

    return NextResponse.json({ items, count, page: safePage, pageSize: PAGE_SIZE });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}