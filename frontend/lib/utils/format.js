export const formatRupiah = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount || 0);

export const shortId = (prefix, id) => `${prefix}-${String(id || '').slice(0, 8)}`;

// Document code: PREFIX-0001 from system sequence number.
// Falls back to shortId for rows without kode (pre-007 data, offline safety).
export const docCode = (prefix, kode, fallbackId) => {
  if (kode === null || kode === undefined || String(kode).trim() === '') {
    return shortId(prefix, fallbackId);
  }
  return `${prefix}-${String(kode).padStart(4, '0')}`;
};
