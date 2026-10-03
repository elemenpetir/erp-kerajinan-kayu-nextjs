import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
});

// Satu hook untuk semua list client: key dari entity + params (page, filter, ...)
// swrOptions opsional diteruskan ke useSWR (mis. { refreshInterval } untuk polling).
export function useList(entity, params = {}, swrOptions = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const suffix = qs.toString();
  const key = `/api/lists/${entity}${suffix ? `?${suffix}` : ''}`;
  return useSWR(key, fetcher, { keepPreviousData: true, revalidateOnFocus: false, ...swrOptions });
}
