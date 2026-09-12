export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);

export const shortId = (prefix, id) => `${prefix}-${String(id || '').slice(0, 8)}`;
