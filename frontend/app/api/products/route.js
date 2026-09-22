import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductsPage, getProductStockMap, getProductBomMap, PAGE_SIZE } from '@/lib/services/manufacturing';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const enrich = searchParams.get('enrich') === 'true';

    const supabase = await createClient();
    const { items, count, page: safePage } = await getProductsPage(supabase, { page });

    if (!enrich || items.length === 0) {
      return NextResponse.json({ items, count, page: safePage, pageSize: PAGE_SIZE });
    }

    const ids = items.map((p) => p.id);
    const [stokMap, bomMap] = await Promise.all([
      getProductStockMap(supabase, ids),
      getProductBomMap(supabase, ids),
    ]);

    const enriched = items.map((p) => ({ ...p, _stok: stokMap[p.id] ?? 0, _biaya: bomMap[p.id] ?? 0 }));

    return NextResponse.json({ items: enriched, count, page: safePage, pageSize: PAGE_SIZE });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}