// Matriks izin frontend (UX saja — enforcement riil di RLS + guard RPC).
// entity = kunci halaman: customers, vendors, categories, departments, employees,
//   customer-invoices, vendor-bills, + list operasional lainnya.

export const MASTER_ENTITIES = ['customers', 'vendors', 'categories', 'departments', 'employees'];
export const FINANCE_ENTITIES = ['customer-invoices', 'vendor-bills'];

export function can(role, action, entity) {
  if (role === 'admin') return true;
  if (role === 'manager') return action === 'read';
  // staff
  if (action === 'read') return !FINANCE_ENTITIES.includes(entity);
  if (action === 'delete') return !MASTER_ENTITIES.includes(entity) && !FINANCE_ENTITIES.includes(entity);
  return true; // create/update operasional + master
}
