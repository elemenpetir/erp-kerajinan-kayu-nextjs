import { createClient } from '../../../../lib/supabase/server';
import { getProductsPage, getProductStockMap, getProductBomMap, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import Pagination from '../../../../components/ui/Pagination';
import ProductViews from './_components/ProductViews';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getProductsPage(supabase, { page });
  const ids = items.map((p) => p.id);
  const [stokMap, bomMap] = await Promise.all([
    getProductStockMap(supabase, ids),
    getProductBomMap(supabase, ids),
  ]);
  const enriched = items.map((p) => ({ ...p, _stok: stokMap[p.id], _biaya: bomMap[p.id] }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Produk</h1>
        <p className="text-sm text-muted-foreground">Kelola produk kerajinan kayu beserta stoknya.</p>
      </div>
      <ProductViews items={enriched} />
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/products" />
    </div>
  );
}
