import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export function useProducts(page = 1) {
  const key = `/api/products?page=${page}&enrich=true`;
  return useSWR(key, fetcher, { keepPreviousData: true, revalidateOnFocus: false });
}

// Optional: separate hooks for stock/bom if needed for other pages
// Currently enrichment is done server-side in the API route