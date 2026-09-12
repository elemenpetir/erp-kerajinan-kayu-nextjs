export const PAGE_SIZE = 20;

export function rangeOf(page, pageSize = PAGE_SIZE) {
  const safePage = Number.isFinite(+page) && +page > 0 ? Math.floor(+page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  return { safePage, from, to };
}
