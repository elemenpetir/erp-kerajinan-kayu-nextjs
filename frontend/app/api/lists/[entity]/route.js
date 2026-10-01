import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomersPage, getQuotationsPage, getSalesOrdersPage, getSalesReport } from '@/lib/services/sales';
import { getVendorsPage, getBillsPage } from '@/lib/services/purchase';
import { getDepartmentsPage, getEmployeesPage, getEmployeeOptions } from '@/lib/services/hr';
import {
  getBomsPage,
  getMaterialsPage,
  getCategoriesPage,
  getProductionOrdersPage,
  getProductsPage,
  getMaterialStockMap,
  getProductStockMap,
  getProductBomMap,
  getStockReport,
} from '@/lib/services/manufacturing';
import {
  getCustomerInvoicesPage,
  getCustomerInvoicesTotal,
  getVendorBillsPage,
  getVendorBillsTotal,
} from '@/lib/services/accounting';
import { getAuditLogPage } from '@/lib/services/audit';

// ponytail: allowlist entity → service; 404 di luar daftar. Satu route untuk
// semua list, bukan file API identik per halaman.
const LISTS = {
  customers: getCustomersPage,
  quotations: getQuotationsPage,
  'sales-orders': getSalesOrdersPage,
  vendors: getVendorsPage,
  departments: getDepartmentsPage,
  employees: getEmployeesPage,
  boms: getBomsPage,
  materials: getMaterialsPage,
  categories: getCategoriesPage,
  'production-orders': getProductionOrdersPage,
  'customer-invoices': getCustomerInvoicesPage,
  'vendor-bills': getVendorBillsPage,
  'sales-report': getSalesReport,
  bills: getBillsPage,
  products: getProductsPage,
  'stock-report': getStockReport,
  'audit-log': getAuditLogPage,
};

// Halaman accounting menampilkan grand total di footer (query terpisah).
const WITH_TOTAL = {
  'customer-invoices': getCustomerInvoicesTotal,
  'vendor-bills': getVendorBillsTotal,
};

// Enrichment row (stok bahan, stok+bom produk) di server agar tetap sedikit query.
const ENRICH = {
  materials: async (supabase, items) => {
    const stokMap = await getMaterialStockMap(
      supabase,
      items.map((b) => b.id),
    );
    return items.map((b) => ({ ...b, _stok: stokMap[b.id] }));
  },
  products: async (supabase, items) => {
    if (items.length === 0) return items;
    const ids = items.map((p) => p.id);
    const [stokMap, bomMap] = await Promise.all([
      getProductStockMap(supabase, ids),
      getProductBomMap(supabase, ids),
    ]);
    return items.map((p) => ({ ...p, _stok: stokMap[p.id] ?? 0, _biaya: bomMap[p.id] ?? 0 }));
  },
};

// Data pendamping untuk form (opsi dropdown) disertakan di respons list.
const EXTRA = {
  departments: async (supabase) => ({
    employees: await getEmployeeOptions(supabase),
  }),
};

export async function GET(req, { params }) {
  try {
    const { entity } = await params;
    const listFn = LISTS[entity];
    if (!listFn) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const q = (searchParams.get('q') || '').trim();
    const tab = searchParams.get('tab') || '';
    const status = searchParams.get('status') || '';

    const supabase = await createClient();
    const result = await listFn(supabase, { page, from, to, q, tab, status });

    const enrichFn = ENRICH[entity];
    if (enrichFn) {
      result.items = await enrichFn(supabase, result.items);
    }

    const totalFn = WITH_TOTAL[entity];
    if (totalFn) {
      const grandTotal = await totalFn(supabase);
      return NextResponse.json({ ...result, grandTotal });
    }

    const extraFn = EXTRA[entity];
    if (extraFn) {
      return NextResponse.json({ ...result, ...(await extraFn(supabase)) });
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
