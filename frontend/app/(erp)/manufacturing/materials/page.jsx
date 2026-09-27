'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useList } from '@/hooks/useList';
import { Button } from '@/components/ui/button';
import Pagination from '../../../../components/ui/Pagination';
import MaterialViews from './_components/MaterialViews';

const PAGE_SIZE = 20;

export default function MaterialsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, error, isLoading, mutate } = useList('materials', { page });

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Bahan</h1>
          <p className="text-sm text-muted-foreground">Kelola bahan baku beserta stoknya.</p>
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
        <Button onClick={() => router.refresh()}>Coba Lagi</Button>
      </div>
    );
  }

  const items = data?.items || [];
  const count = data?.count || 0;
  const safePage = data?.page || page;

  function goToPage(newPage) {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
    if (newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Bahan</h1>
        <p className="text-sm text-muted-foreground">Kelola bahan baku beserta stoknya.</p>
      </div>
      <MaterialViews items={items} onMutate={() => mutate()} />
      <Pagination page={safePage} pageSize={PAGE_SIZE} count={count} basePath="/manufacturing/materials" onPageChange={goToPage} />
    </div>
  );
}
