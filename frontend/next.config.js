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
    ];
  },
};

module.exports = nextConfig;
