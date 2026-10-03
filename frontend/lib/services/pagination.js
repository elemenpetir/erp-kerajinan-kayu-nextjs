export const PAGE_SIZE = 20;

export function rangeOf(page, pageSize = PAGE_SIZE) {
  const safePage = Number.isFinite(+page) && +page > 0 ? Math.floor(+page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { safePage, from, to };
}

// Bersihkan karakter spesial PostgREST/LIKE dari input user agar tak merusak filter .or()
// dan tak jadi wildcard tak disengaja. Bintang (*) tetap wildcard (fitur).
export function cleanQ(q) {
  return String(q || '').replace(/[%\\,()]/g, '').trim();
}
