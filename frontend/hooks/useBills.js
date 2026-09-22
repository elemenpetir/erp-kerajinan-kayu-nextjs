import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

export function useBills(page = 1) {
  const key = `/api/bills?page=${page}`;
  return useSWR(key, fetcher, { keepPreviousData: true, revalidateOnFocus: false });
}