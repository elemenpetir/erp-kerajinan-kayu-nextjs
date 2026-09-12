-- Phase 0: indexes for scalable list queries (pagination + status filters)
CREATE INDEX IF NOT EXISTS idx_order_produksi_produk_status ON order_produksi(produk_id, status);
CREATE INDEX IF NOT EXISTS idx_sales_order_status ON sales_order(status);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_quotation_status ON quotation(status);
