'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Pagination from '../../../../components/ui/Pagination';
import ProductViews from './_components/ProductViews';

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { data, error, isLoading } = useProducts(page);

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-lg font-semibold">Produk</h1>
          <p className="text-sm text-muted-foreground">Kelola produk kerajinan kayu beserta stoknya.</p>
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

  // Handle pagination with pushState (no reload)
  function goToPage(newPage) {
    if (newPage < 1) return;
    const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
    if (newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    router.refresh(); // triggers SWR re-fetch via key change
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Produk</h1>
        <p className="text-sm text-muted-foreground">Kelola produk kerajinan kayu beserta stoknya.</p>
      </div>
      <ProductViews items={items} />
      <Pagination
        page={safePage}
        pageSize={PAGE_SIZE}
        count={count}
        basePath="/manufacturing/products"
        onPageChange={goToPage}
      />
    </div>
  );
}