/*
  HTTP smoke test (no browser).
  - Public routes (/, /login): expect 200.
  - Protected routes (anon): expect redirect to /login (auth guard active).
  - Removed legacy URLs: expect 404 (redirects cleaned up).
  Usage: node scripts/smoke.js [baseURL]
  Exit 0 = all green, 1 = failures.
*/
const BASE = (process.argv[2] || 'https://erp-kerajinan-kayu-nextjs.vercel.app').replace(/\/$/, '');

const expect200 = ['/', '/login'];

const expectLoginRedirect = [
  '/hr/departments',
  '/hr/employees',
  '/manufacturing/products',
  '/manufacturing/materials',
  '/manufacturing/boms',
  '/manufacturing/categories',
  '/manufacturing/production-orders',
  '/purchase/vendors',
  '/purchase/bills',
  '/sales/customers',
  '/sales/quotations',
  '/sales/sales-orders',
  '/accounting/customer-invoices',
  '/accounting/vendor-bills',
];

const expect404 = []; // era guard: unknown paths → /login, never 404 for anon

// Legacy URLs must NOT redirect to new paths anymore (transitions removed).
// Anon hits the auth guard instead → 307 to /login.
const expectLegacyGuarded = [
  '/manufaktur',
  '/manufaktur/bahan',
  '/manufaktur/bom',
  '/manufaktur/kategori',
  '/manufaktur/order-produksi',
  '/employees/departemen',
  '/employees/karyawan',
  '/sales/quotation',
  '/sales/orders',
  '/accounting/invoices',
  '/accounting/bills',
  '/purchase/vendors/create',
  '/sales/customers/create',
  '/purchase/bills/create',
];

let pass = 0;
let fail = 0;
const failures = [];

function report(ok, label, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` [${detail}]` : ''}`);
  ok ? pass++ : (fail++, failures.push(`${label} ${detail || ''}`.trim()));
}

async function check200(path) {
  try {
    const res = await fetch(BASE + path);
    const body = await res.text();
    report(res.status === 200 && body.length > 1000, `200 ${path}`, res.status);
  } catch (e) {
    report(false, `200 ${path}`, e.message);
  }
}

async function checkLoginRedirect(path) {
  try {
    const res = await fetch(BASE + path, { redirect: 'manual' });
    const loc = res.headers.get('location') || '';
    report(
      [307, 308].includes(res.status) && loc.includes('/login'),
      `guard ${path}`,
      `${res.status} → ${loc}`,
    );
  } catch (e) {
    report(false, `guard ${path}`, e.message);
  }
}

(async () => {
  console.log(`Smoke vs ${BASE}\n--- public (200) ---`);
  for (const p of expect200) await check200(p);
  console.log('--- auth guard (→ /login) ---');
  for (const p of expectLoginRedirect) await checkLoginRedirect(p);
  console.log('--- legacy guarded (→ /login, not new paths) ---');
  for (const p of expectLegacyGuarded) await checkLoginRedirect(p);
  console.log(`\n${pass} pass, ${fail} fail`);
  if (fail) {
    console.log('Failures:\n- ' + failures.join('\n- '));
    process.exit(1);
  }
})();
