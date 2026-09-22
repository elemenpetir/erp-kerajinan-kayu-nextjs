import { useMemo } from 'react';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export function useStock({ tab = 'produk', status = 'semua', q = '' } = {}) {
  const params = new URLSearchParams({ tab, status });
  if (q) params.set('q', q);

  const key = `/api/stock?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
    // Client-side filtering is done in the API, so no need for extra filtering here
  });

  return {
    data: data?.items || [],
    count: data?.count || 0,
    produkCount: data?.produkCount || 0,
    bahanCount: data?.bahanCount || 0,
    kritis: data?.kritis || 0,
    error,
    isLoading,
    mutate,
  };
}