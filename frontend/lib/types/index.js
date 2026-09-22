// lib/types/index.js

/** @typedef {{id: string, kode: number|null, referensi_vendor: string|null, deadline_order: string|null, total_biaya: number, status: 'Draft Bill'|'Bill'|'Paid', created_at: string}} Bill */
/** @typedef {{items: Bill[], count: number, page: number, pageSize: number}} BillResponse */

/** @typedef {{id: string, kode: number|null, nama: string, harga_produksi: number, gambar_url: string|null, created_at: string, _stok?: number, _biaya?: number}} Product */
/** @typedef {{items: Product[], count: number, page: number, pageSize: number}} ProductResponse */

/** @typedef {{id: string, kode: number|null, nama: string, _stok: number}} StockRow */
/** @typedef {{items: StockRow[], count: number}} StockResponse */