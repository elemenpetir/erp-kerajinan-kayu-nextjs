import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomersPage, getQuotationsPage, getSalesOrdersPage } from '@/lib/services/sales';
import { getVendorsPage } from '@/lib/services/purchase';
import { getDepartmentsPage, getEmployeesPage } from '@/lib/services/hr';
import {
  getBomsPage,
  getMaterialsPage,
  getCategoriesPage,
  getProductionOrdersPage,
} from '@/lib/services/manufacturing';
import {
  getCustomerInvoicesPage,
  getCustomerInvoicesTotal,
  getVendorBillsPage,
  getVendorBillsTotal,
} from '@/lib/services/accounting';

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
};

// Halaman accounting menampilkan grand total di footer (query terpisah).
const WITH_TOTAL = {
  'customer-invoices': getCustomerInvoicesTotal,
  'vendor-bills': getVendorBillsTotal,
};

export async function GET(req, { params }) {
  try {
    const { entity } = await params;
    const listFn = LISTS[entity];
    if (!listFn) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const supabase = await createClient();
    const result = await listFn(supabase, { page });

    const totalFn = WITH_TOTAL[entity];
    if (totalFn) {
      const grandTotal = await totalFn(supabase);
      return NextResponse.json({ ...result, grandTotal });
    }
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
