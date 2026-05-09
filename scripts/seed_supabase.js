/*
  Seed script for Supabase demo data.
  Usage:
    Set environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    node scripts/seed_supabase.js

  NOTE: use service role key to run inserts with full privileges.
*/

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function seed() {
  try {
    // Kategori
    const kategori = [
      { nama: 'Furniture' },
      { nama: 'Dekorasi' }
    ];
    await supabase.from('kategori').insert(kategori);

    // Bahan
    const bahan = [
      { nama: 'Kayu Jati', biaya: 150000.00, harga: 200000.00, internal_referensi: 'BJ-001' },
      { nama: 'Paku', biaya: 500.00, harga: 1000.00, internal_referensi: 'PAK-01' }
    ];
    await supabase.from('bahan').insert(bahan);

    // Produk
    // We will fetch kategori id to assign
    const { data: kategoriRows } = await supabase.from('kategori').select('*').limit(1);
    const kategoriId = kategoriRows && kategoriRows[0] ? kategoriRows[0].id : null;

    const produk = [
      { nama: 'Meja Minimalis', harga_produksi: 500000.00, biaya_produksi: 350000.00, internal_referensi: 'PR-001', kategori_id: kategoriId, barcode: '890123' },
      { nama: 'Rak Dinding', harga_produksi: 300000.00, biaya_produksi: 200000.00, internal_referensi: 'PR-002', kategori_id: kategoriId, barcode: '890124' }
    ];
    await supabase.from('produk').insert(produk);

    // Prepare components for BOM (we'll read bahan ids)
    const { data: bahanRows } = await supabase.from('bahan').select('*');
    const kayu = bahanRows.find(b => b.nama.includes('Kayu')) || bahanRows[0];
    const paku = bahanRows.find(b => b.nama.includes('Paku')) || bahanRows[1];

    const { data: produkRows } = await supabase.from('produk').select('*');
    const meja = produkRows.find(p => p.nama.includes('Meja')) || produkRows[0];

    const bom = [
      {
        produk_id: meja.id,
        kategori_id: kategoriId,
        components: [
          { bahan_id: kayu.id, nama_bahan: kayu.nama, jumlah: 5, satuan: 'pcs', harga: kayu.biaya },
          { bahan_id: paku.id, nama_bahan: paku.nama, jumlah: 20, satuan: 'pcs', harga: paku.biaya }
        ],
        jumlah_produk: 1,
        internal_referensi: 'BOM-001',
        total_biaya_produk: 350000.00,
        total_biaya_bahan: (5 * kayu.biaya) + (20 * paku.biaya)
      }
    ];
    await supabase.from('bom').insert(bom);

    // Order Produksi
    const { data: bomRows } = await supabase.from('bom').select('*');
    const bom1 = bomRows[0];
    await supabase.from('order_produksi').insert([
      { bom_id: bom1.id, produk_id: meja.id, jumlah_produk: 2, components: bom1.components, status: 'Konfirmasi' }
    ]);

    // Vendors & Customers
    await supabase.from('vendor_individual').insert([
      { nama: 'Asep Wijaya', nama_perusahaan: 'CV Kayu Indah', alamat: 'Jl. Kenanga 10', telp: '081234567890', email: 'asep@example.com', posisi_pekerjaan: 'Owner' },
      { nama: 'Budi Santoso', nama_perusahaan: 'UD Mebel', alamat: 'Jl. Melati 5', telp: '081298765432', email: 'budi@example.com', posisi_pekerjaan: 'Purchasing' }
    ]);

    await supabase.from('vendor_company').insert([
      { nama: 'PT Bahan Kayu', alamat: 'Jl. Industri 1', telp: '0215551234', email: 'sales@bahan.com' }
    ]);

    await supabase.from('customer_individual').insert([
      { nama: 'Rina Putri', nama_perusahaan: 'Rina Home', alamat: 'Jl. Anggrek 2', telp: '082112345678', email: 'rina@example.com', posisi_pekerjaan: 'Owner' },
      { nama: 'Dewi Lestari', nama_perusahaan: 'Dekorasi Dewi', alamat: 'Jl. Mawar 3', telp: '082198765432', email: 'dewi@example.com', posisi_pekerjaan: 'Buyer' }
    ]);

    await supabase.from('customer_company').insert([
      { nama: 'Toko Furnish', alamat: 'Jl. Besar 99', telp: '021777888', email: 'contact@furnish.com' }
    ]);

    // Quotation -> Sales Order -> Payment flow
    const { data: customerRows } = await supabase.from('customer_individual').select('*');
    const customer = customerRows[0];

    const items = [
      { produk_id: meja.id, nama_produk: meja.nama, jumlah: 1, satuan_biaya: meja.harga_produksi, total_biaya: meja.harga_produksi }
    ];

    const { data: q } = await supabase.from('quotation').insert([
      { customer_id: customer.id, customer_snapshot: { nama: customer.nama, email: customer.email }, expiration: null, payment_terms: '14 hari', items, total_biaya: meja.harga_produksi, status: 'Quotation' }
    ]).select('*').single();

    const { data: so } = await supabase.from('sales_order').insert([
      { quotation_id: q.id, customer_id: customer.id, customer_snapshot: q.customer_snapshot, items, total_biaya: q.total_biaya, status: 'To Invoice', status_delivery: 'Sedang Dikirim' }
    ]).select('*').single();

    await supabase.from('pembayaran_sales_order').insert([
      { sales_order_id: so.id, journal: 'Cash', status: 'Belum Lunas', jumlah_pembayaran: 0.00, payment_date: null, catatan: 'Belum dibayar' }
    ]);

    // Departments & Employees
    await supabase.from('departemen').insert([
      { nama_departemen: 'Produksi', manager: 'Manager Produksi' },
      { nama_departemen: 'Penjualan', manager: 'Manager Sales' }
    ]);

    const { data: depRows } = await supabase.from('departemen').select('*');
    await supabase.from('karyawan').insert([
      { departemen_id: depRows[0].id, nama: 'Joko', posisi: 'Operator', telp: '08130000001', email: 'joko@example.com', manager: 'Manager Produksi' },
      { departemen_id: depRows[1].id, nama: 'Siti', posisi: 'Sales', telp: '08130000002', email: 'siti@example.com', manager: 'Manager Sales' }
    ]);

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

seed();
