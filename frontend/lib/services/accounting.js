import { PAGE_SIZE, rangeOf } from './pagination';

export { PAGE_SIZE };

export async function getCustomerInvoicesPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('customer_invoice')
    .select('id,jumlah_pembayaran,payment_date,sales_order(customer_snapshot,status,id)', { count: 'exact' })
    .order('payment_date', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { items: data || [], count: count || 0, page: safePage, pageSize };
}

export async function getVendorBillsPage(supabase, { page = 1, pageSize = PAGE_SIZE } = {}) {
  const { safePage, from, to } = rangeOf(page, pageSize);
  const { data, count, error } = await supabase
    .from('vendor_bill')
    .select('id,jumlah_pembayaran,payment_date,bills(referensi_vendor,status,vendor_id)', { count: 'exact' })
    .order('payment_date', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);

  const items = data || [];
  const vendorIds = [...new Set(items.map((b) => b.bills?.vendor_id).filter(Boolean))];
  let vendorMap = {};
  if (vendorIds.length) {
    const [{ data: vInd }, { data: vCo }] = await Promise.all([
      supabase.from('vendor_individual').select('id,nama').in('id', vendorIds),
      supabase.from('vendor_company').select('id,nama').in('id', vendorIds),
    ]);
    [...(vInd || []), ...(vCo || [])].forEach((v) => {
      vendorMap[v.id] = v.nama;
    });
  }
  return {
    items: items.map((b) => ({ ...b, vendor_nama: vendorMap[b.bills?.vendor_id] || '-' })),
    count: count || 0,
    page: safePage,
    pageSize,
  };
}
