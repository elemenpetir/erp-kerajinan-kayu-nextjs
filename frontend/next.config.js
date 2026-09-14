/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/employees/departemen', destination: '/hr/departments', permanent: false },
      { source: '/employees/departemen/:path*', destination: '/hr/departments/:path*', permanent: false },
      { source: '/manufaktur/kategori', destination: '/manufacturing/categories', permanent: false },
      { source: '/employees/karyawan', destination: '/hr/employees', permanent: false },
      { source: '/manufaktur/order-produksi', destination: '/manufacturing/production-orders', permanent: false },
      { source: '/sales/quotation', destination: '/sales/quotations', permanent: false },
      { source: '/sales/orders', destination: '/sales/sales-orders', permanent: false },
      { source: '/manufaktur', destination: '/manufacturing/products', permanent: false },
      { source: '/manufaktur/bahan', destination: '/manufacturing/materials', permanent: false },
      { source: '/manufaktur/bom', destination: '/manufacturing/boms', permanent: false },
      { source: '/accounting/invoices', destination: '/accounting/customer-invoices', permanent: false },
      { source: '/accounting/bills', destination: '/accounting/vendor-bills', permanent: false },
      { source: '/employees/karyawan/:path*', destination: '/hr/employees/:path*', permanent: false },
      { source: '/sales/quotation/:path*', destination: '/sales/quotations/:path*', permanent: false },
      { source: '/sales/orders/:path*', destination: '/sales/sales-orders/:path*', permanent: false },
      { source: '/manufaktur/order-produksi/:path*', destination: '/manufacturing/production-orders/:path*', permanent: false },
      { source: '/purchase/vendors/create', destination: '/purchase/vendors/new', permanent: false },
      { source: '/sales/customers/create', destination: '/sales/customers/new', permanent: false },
      { source: '/purchase/bills/create', destination: '/purchase/bills/new', permanent: false },
    ];
  },
};

module.exports = nextConfig;
