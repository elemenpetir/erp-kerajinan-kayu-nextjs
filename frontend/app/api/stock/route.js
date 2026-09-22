import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProductStockMap, getMaterialStockMap } from '@/lib/services/manufacturing';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get('tab') === 'bahan' ? 'bahan' : 'produk';
    const status = searchParams.get('status') === 'kritis' ? 'kritis' : 'semua';
    const q = (searchParams.get('q') || '').trim();

    const supabase = await createClient();
    const [{ data: produk }, { data: bahan }] = await Promise.all([
      supabase.from('produk').select('id,kode,nama').order('nama'),
      supabase.from('bahan').select('id,kode,nama').order('nama'),
    ]);

    const produkList = produk || [];
    const bahanList = bahan || [];
    const [stokP, stokB] = await Promise.all([
      getProductStockMap(supabase, produkList.map((p) => p.id)),
      getMaterialStockMap(supabase, bahanList.map((b) => b.id)),
    ]);

    const produkRows = produkList.map((p) => ({ ...p, _stok: stokP[p.id] ?? 0 }));
    const bahanRows = bahanList.map((b) => ({ ...b, _stok: stokB[b.id] ?? 0 }));

    const ambang = tab === 'produk' ? 5 : 10;
    const rows = (tab === 'produk' ? produkRows : bahanRows)
      .filter((r) => (status === 'kritis' ? r._stok <= ambang : true))
      .filter((r) => (q ? r.nama.toLowerCase().includes(q.toLowerCase()) : true));

    return NextResponse.json({
      items: rows,
      count: rows.length,
      produkCount: produkRows.length,
      bahanCount: bahanRows.length,
      kritis: [...produkRows.filter((r) => r._stok <= 5), ...bahanRows.filter((r) => r._stok <= 10)].length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}