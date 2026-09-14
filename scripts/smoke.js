/*
  Read-only HTTP smoke test (no browser, GET only — safe for production).
  Usage: node scripts/smoke.js [baseURL]
  Default: https://erp-kerajinan-kayu-nextjs.vercel.app
  Exit 0 = all green, 1 = failures.
*/
const BASE = (process.argv[2] || 'https://erp-kerajinan-kayu-nextjs.vercel.app').replace(/\/$/, '');

const expect200 = [
  '/',
  '/hr/departments',
  '/hr/employees',
  '/hr/employees/new',
  '/manufacturing/products',
  '/manufacturing/products/new',
  '/manufacturing/materials',
  '/manufacturing/materials/new',
  '/manufacturing/boms',
  '/manufacturing/boms/new',
  '/manufacturing/categories',
  '/manufacturing/production-orders',
  '/manufacturing/production-orders/new',
  '/purchase/vendors',
  '/purchase/vendors/new',
  '/purchase/bills',
  '/purchase/bills/new',
  '/sales/customers',
  '/sales/customers/new',
  '/sales/quotations',
  '/sales/quotations/new',
  '/sales/sales-orders',
  '/accounting/customer-invoices',
  '/accounting/vendor-bills',
];

const expectRedirect = [
  ['/employees/departemen', '/hr/departments'],
  ['/manufaktur/kategori', '/manufacturing/categories'],
  ['/employees/karyawan', '/hr/employees'],
  ['/manufaktur/order-produksi', '/manufacturing/production-orders'],
  ['/sales/quotation', '/sales/quotations'],
  ['/sales/orders', '/sales/sales-orders'],
  ['/manufaktur', '/manufacturing/products'],
  ['/manufaktur/bahan', '/manufacturing/materials'],
  ['/manufaktur/bom', '/manufacturing/boms'],
  ['/accounting/invoices', '/accounting/customer-invoices'],
  ['/accounting/bills', '/accounting/vendor-bills'],
  ['/purchase/vendors/create', '/purchase/vendors/new'],
  ['/sales/customers/create', '/sales/customers/new'],
  ['/purchase/bills/create', '/purchase/bills/new'],
];

let pass = 0;
let fail = 0;
const failures = [];

async function check200(path) {
  try {
    const res = await fetch(BASE + path);
    const body = await res.text();
    const ok =
      res.status === 200 &&
      body.length > 1000 &&
      !body.includes('Application error') &&
      !body.includes('__NEXT_ERROR__');
    ok ? pass++ : (fail++, failures.push(`GET ${path} → ${res.status} (len ${body.length})`));
    console.log(`${ok ? 'PASS' : 'FAIL'} 200 ${path} [${res.status}]`);
  } catch (e) {
    fail++;
    failures.push(`GET ${path} → ERROR ${e.message}`);
    console.log(`FAIL 200 ${path} [${e.message}]`);
  }
}

async function checkRedirect(from, to) {
  try {
    const res = await fetch(BASE + from, { redirect: 'manual' });
    const loc = res.headers.get('location') || '';
    const ok = [301, 302, 307, 308].includes(res.status) && loc.endsWith(to);
    ok ? pass++ : (fail++, failures.push(`${from} → ${res.status} ${loc} (want …${to})`));
    console.log(`${ok ? 'PASS' : 'FAIL'} redirect ${from} → ${loc} [${res.status}]`);
  } catch (e) {
    fail++;
    failures.push(`${from} → ERROR ${e.message}`);
    console.log(`FAIL redirect ${from} [${e.message}]`);
  }
}

(async () => {
  console.log(`Smoke vs ${BASE}\n--- routes (200) ---`);
  for (const p of expect200) await check200(p);
  console.log('--- redirects ---');
  for (const [f, t] of expectRedirect) await checkRedirect(f, t);
  console.log(`\n${pass} pass, ${fail} fail`);
  if (fail) {
    console.log('Failures:\n- ' + failures.join('\n- '));
    process.exit(1);
  }
})();
