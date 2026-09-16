import { createClient } from '../../../../lib/supabase/server';
import { getMaterialsPage, getMaterialStockMap, PAGE_SIZE } from '../../../../lib/services/manufacturing';
import Pagination from '../../../../components/ui/Pagination';
import MaterialViews from './_components/MaterialViews';

export const dynamic = 'force-dynamic';

export default async function MaterialsPage({ searchParams }) {
  const { page } = await searchParams;
  const supabase = await createClient();
  const { items, count, page: safePage } = await getMaterialsPage(supabase, { page });
  const stokMap = await getMaterialStockMap(
    supabase,
    items.map((b) => b.id),
  );
  const enriched = items.map((b) => ({ ...b, _stok: stokMap[b.id] }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Bahan</h1>
        <p className="text-sm text-muted-foreground">Kelola bahan baku beserta stoknya.</p>
      </div>
      <MaterialViews items={enriched} />
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/materials" />
    </div>
  );
}
