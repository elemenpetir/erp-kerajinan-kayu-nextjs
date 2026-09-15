/*
  Seed script for Supabase demo data.
  Usage:
    Set environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    node scripts/seed_supabase.js

  NOTE:
    - WIPE & RESEED: script menghapus seluruh data tabel ERP lalu mengisi ulang,
      sehingga hasilnya selalu bersih dan konsisten untuk demo portofolio.
    - Gunakan service role key untuk insert/delete dengan full privileges.
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

async function insertAll(table, rows) {
  if (!rows.length) return [];
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) throw new Error(`insert ${table}: ${error.message}`);
  return data;
}

async function insertOne(table, row) {
  const rows = await insertAll(table, [row]);
  return rows[0];
}

const byName = (rows, nama) => rows.find((r) => r.nama === nama);

function buildComponents(spec, bahanByName) {
  return spec.map(([bahanNama, jumlah]) => {
    const b = bahanByName[bahanNama];
    if (!b) throw new Error(`Bahan tidak ditemukan: ${bahanNama}`);
    return {
      bahan_id: b.id,
      nama_bahan: b.nama,
      jumlah,
      satuan: 'pcs',
      harga: Number(b.biaya)
    };
  });
}

function bomTotal(components) {
  return Number(components.reduce((s, c) => s + c.jumlah * c.harga, 0).toFixed(2));
}

function makeSalesItems(spec, produkByName) {
  return spec.map(([namaProduk, jumlah]) => {
    const p = produkByName[namaProduk];
    if (!p) throw new Error(`Produk tidak ditemukan: ${namaProduk}`);
    const satuan = Number(p.harga_produksi);
    return {
      produk_id: p.id,
      nama_produk: p.nama,
      jumlah,
      satuan_biaya: satuan,
      total_biaya: satuan * jumlah
    };
  });
}

function itemsTotal(items) {
  return Number(items.reduce((s, i) => s + i.total_biaya, 0).toFixed(2));
}

function billItemsTotal(items) {
  return Number(items.reduce((s, i) => s + i.subtotal, 0).toFixed(2));
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function daysAhead(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Wipe (children dulu, sesuai urutan FK)
// ---------------------------------------------------------------------------
async function wipe() {
  const tables = [
    'pembayaran_sales_order',
    'pembayaran_bill',
    'customer_invoice',
    'vendor_bill',
    'bills',
    'sales_order',
    'quotation',
    'order_produksi',
    'bom',
    'produk',
    'bahan',
    'kategori',
    'karyawan',
    'departemen',
    'vendor_company',
    'vendor_individual',
    'customer_company',
    'customer_individual',
    'rfq'
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', ZERO_UUID);
    if (error) {
      console.log(`  wipe ${table}: skipped (${error.message})`);
    } else {
      console.log(`  wipe ${table}: ok`);
    }
  }
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function seed() {
  console.log('== Wipe data lama ==');
  await wipe();

  console.log('== Kategori ==');
  const kategoriData = [
    { nama: 'Furniture' },
    { nama: 'Dekorasi' },
    { nama: 'Meja & Kursi' },
    { nama: 'Penyimpanan' },
    { nama: 'Dapur' },
    { nama: 'Kamar Tidur' }
  ];
  const kategoriRows = await insertAll('kategori', kategoriData);
  const katByName = Object.fromEntries(kategoriRows.map((r) => [r.nama, r.id]));

  console.log('== Bahan ==');
  const bahanData = [
    { nama: 'Kayu Jati', biaya: 150000.0, harga: 200000.0, internal_referensi: 'BJ-001', kode: 1 },
    { nama: 'Kayu Mahoni', biaya: 90000.0, harga: 130000.0, internal_referensi: 'BM-001', kode: 2 },
    { nama: 'Kayu Pinus', biaya: 70000.0, harga: 105000.0, internal_referensi: 'BP-001', kode: 3 },
    { nama: 'Triplek 12mm', biaya: 85000.0, harga: 120000.0, internal_referensi: 'TRL-001', kode: 4 },
    { nama: 'Paku', biaya: 500.0, harga: 1000.0, internal_referensi: 'PAK-001', kode: 5 },
    { nama: 'Sekrup', biaya: 150.0, harga: 300.0, internal_referensi: 'SKR-001', kode: 6 },
    { nama: 'Lem Kayu', biaya: 45000.0, harga: 65000.0, internal_referensi: 'LEM-001', kode: 7 },
    { nama: 'Cat Pernis', biaya: 75000.0, harga: 110000.0, internal_referensi: 'CPN-001', kode: 8 },
    { nama: 'Stain Kayu', biaya: 60000.0, harga: 90000.0, internal_referensi: 'STN-001', kode: 9 },
    { nama: 'Minyak Kayu', biaya: 50000.0, harga: 80000.0, internal_referensi: 'MNK-001', kode: 10 },
    { nama: 'Engsel', biaya: 8000.0, harga: 12000.0, internal_referensi: 'ENG-001', kode: 11 },
    { nama: 'Handle', biaya: 15000.0, harga: 22000.0, internal_referensi: 'HDL-001', kode: 12 },
    { nama: 'Rel Laci', biaya: 20000.0, harga: 30000.0, internal_referensi: 'REL-001', kode: 13 },
    { nama: 'Kaca 5mm', biaya: 95000.0, harga: 140000.0, internal_referensi: 'KCA-001', kode: 14 },
    { nama: 'Ampelas', biaya: 5000.0, harga: 9000.0, internal_referensi: 'AMP-001', kode: 15 }
  ];
  const bahanRows = await insertAll('bahan', bahanData);
  const bahanByName = Object.fromEntries(bahanRows.map((r) => [r.nama, r]));

  console.log('== Produk ==');
  const produkData = [
    { nama: 'Meja Minimalis', harga_produksi: 500000.0, internal_referensi: 'PR-001', kategori_id: katByName.Furniture, barcode: '8991002000001', kode: 1 },
    { nama: 'Rak Dinding', harga_produksi: 300000.0, internal_referensi: 'PR-002', kategori_id: katByName.Dekorasi, barcode: '8991002000002', kode: 2 },
    { nama: 'Meja Makan 6 Kursi', harga_produksi: 1250000.0, internal_referensi: 'PR-003', kategori_id: katByName['Meja & Kursi'], barcode: '8991002000003', kode: 3 },
    { nama: 'Kursi Kayu', harga_produksi: 350000.0, internal_referensi: 'PR-004', kategori_id: katByName['Meja & Kursi'], barcode: '8991002000004', kode: 4 },
    { nama: 'Kursi Santai', harga_produksi: 450000.0, internal_referensi: 'PR-005', kategori_id: katByName['Meja & Kursi'], barcode: '8991002000005', kode: 5 },
    { nama: 'Lemari TV', harga_produksi: 800000.0, internal_referensi: 'PR-006', kategori_id: katByName.Furniture, barcode: '8991002000006', kode: 6 },
    { nama: 'Meja TV', harga_produksi: 650000.0, internal_referensi: 'PR-007', kategori_id: katByName.Furniture, barcode: '8991002000007', kode: 7 },
    { nama: 'Rak Buku', harga_produksi: 550000.0, internal_referensi: 'PR-008', kategori_id: katByName.Penyimpanan, barcode: '8991002000008', kode: 8 },
    { nama: 'Headboard', harga_produksi: 900000.0, internal_referensi: 'PR-009', kategori_id: katByName['Kamar Tidur'], barcode: '8991002000009', kode: 9 },
    { nama: 'Rak Dapur', harga_produksi: 400000.0, internal_referensi: 'PR-010', kategori_id: katByName.Dapur, barcode: '8991002000010', kode: 10 },
    { nama: 'Lemari Pakaian 2 Pintu', harga_produksi: 1600000.0, internal_referensi: 'PR-011', kategori_id: katByName['Kamar Tidur'], barcode: '8991002000011', kode: 11 },
    { nama: 'Sofa Kayu 2 Dudukan', harga_produksi: 1000000.0, internal_referensi: 'PR-012', kategori_id: katByName.Furniture, barcode: '8991002000012', kode: 12 },
    { nama: 'Meja Kerja', harga_produksi: 750000.0, internal_referensi: 'PR-013', kategori_id: katByName.Furniture, barcode: '8991002000013', kode: 13 },
    { nama: 'Rak Botol & Gelas', harga_produksi: 250000.0, internal_referensi: 'PR-014', kategori_id: katByName.Dapur, barcode: '8991002000014', kode: 14 },
    { nama: 'Nakas', harga_produksi: 320000.0, internal_referensi: 'PR-015', kategori_id: katByName['Kamar Tidur'], barcode: '8991002000015', kode: 15 },
    { nama: 'Gantungan Dinding', harga_produksi: 200000.0, internal_referensi: 'PR-016', kategori_id: katByName.Dekorasi, barcode: '8991002000016', kode: 16 }
  ];
  const produkRows = await insertAll('produk', produkData);
  const produkByName = Object.fromEntries(produkRows.map((r) => [r.nama, r]));

  console.log('== BOM ==');
  const bomSpecs = [
    { nama: 'Meja Minimalis', ref: 'BOM-001', komponen: [['Kayu Jati', 2], ['Paku', 20], ['Lem Kayu', 1], ['Cat Pernis', 1], ['Ampelas', 2]] },
    { nama: 'Rak Dinding', ref: 'BOM-002', komponen: [['Kayu Pinus', 1], ['Paku', 10], ['Lem Kayu', 1], ['Stain Kayu', 1], ['Ampelas', 1]] },
    { nama: 'Meja Makan 6 Kursi', ref: 'BOM-003', komponen: [['Kayu Jati', 6], ['Sekrup', 50], ['Lem Kayu', 2], ['Cat Pernis', 2], ['Ampelas', 4]] },
    { nama: 'Kursi Kayu', ref: 'BOM-004', komponen: [['Kayu Mahoni', 2], ['Paku', 12], ['Lem Kayu', 1], ['Stain Kayu', 1], ['Ampelas', 1]] },
    { nama: 'Kursi Santai', ref: 'BOM-005', komponen: [['Kayu Mahoni', 2], ['Sekrup', 20], ['Lem Kayu', 1], ['Cat Pernis', 1], ['Ampelas', 2]] },
    { nama: 'Lemari TV', ref: 'BOM-006', komponen: [['Kayu Jati', 3], ['Triplek 12mm', 1], ['Engsel', 4], ['Handle', 2], ['Paku', 30], ['Lem Kayu', 1], ['Cat Pernis', 1], ['Ampelas', 2]] },
    { nama: 'Meja TV', ref: 'BOM-007', komponen: [['Kayu Jati', 2], ['Triplek 12mm', 1], ['Rel Laci', 2], ['Handle', 2], ['Paku', 20], ['Lem Kayu', 1], ['Stain Kayu', 1], ['Ampelas', 2]] },
    { nama: 'Rak Buku', ref: 'BOM-008', komponen: [['Kayu Mahoni', 3], ['Triplek 12mm', 1], ['Paku', 25], ['Lem Kayu', 1], ['Cat Pernis', 1], ['Ampelas', 2]] },
    { nama: 'Headboard', ref: 'BOM-009', komponen: [['Kayu Jati', 4], ['Paku', 40], ['Lem Kayu', 1], ['Cat Pernis', 1], ['Ampelas', 3], ['Stain Kayu', 1]] },
    { nama: 'Rak Dapur', ref: 'BOM-010', komponen: [['Kayu Pinus', 2], ['Triplek 12mm', 1], ['Engsel', 2], ['Handle', 2], ['Paku', 15], ['Lem Kayu', 1], ['Ampelas', 1]] },
    { nama: 'Lemari Pakaian 2 Pintu', ref: 'BOM-011', komponen: [['Kayu Jati', 7], ['Triplek 12mm', 2], ['Engsel', 4], ['Handle', 4], ['Paku', 40], ['Lem Kayu', 2], ['Cat Pernis', 2], ['Ampelas', 4]] },
    { nama: 'Sofa Kayu 2 Dudukan', ref: 'BOM-012', komponen: [['Kayu Jati', 4], ['Paku', 30], ['Sekrup', 20], ['Lem Kayu', 1], ['Cat Pernis', 1], ['Ampelas', 3]] },
    { nama: 'Meja Kerja', ref: 'BOM-013', komponen: [['Kayu Mahoni', 3], ['Triplek 12mm', 2], ['Sekrup', 30], ['Lem Kayu', 1], ['Stain Kayu', 1], ['Ampelas', 2]] },
    { nama: 'Rak Botol & Gelas', ref: 'BOM-014', komponen: [['Kayu Pinus', 1], ['Triplek 12mm', 1], ['Paku', 10], ['Lem Kayu', 1], ['Ampelas', 1]] },
    { nama: 'Nakas', ref: 'BOM-015', komponen: [['Kayu Mahoni', 1], ['Triplek 12mm', 1], ['Paku', 12], ['Lem Kayu', 1], ['Ampelas', 1]] },
    { nama: 'Gantungan Dinding', ref: 'BOM-016', komponen: [['Kayu Pinus', 1], ['Paku', 8], ['Lem Kayu', 1], ['Minyak Kayu', 1], ['Ampelas', 1]] }
  ];

  const bomRows = [];
  for (let i = 0; i < bomSpecs.length; i++) {
    const spec = bomSpecs[i];
    const components = buildComponents(spec.komponen, bahanByName);
    const totalBahan = bomTotal(components);
    const produk = byName(produkRows, spec.nama);
    bomRows.push(
      await insertOne('bom', {
        kode: i + 1,
        produk_id: produk.id,
        kategori_id: produk.kategori_id,
        components,
        jumlah_produk: 1,
        internal_referensi: spec.ref,
        total_biaya_produk: Number(produk.harga_produksi),
        total_biaya_bahan: totalBahan
      })
    );
  }

  // Isi biaya_produksi produk dari BOM agar detail produk menampilkan margin yang benar
  const biayaUpdates = bomRows.map((b) => ({
    id: b.produk_id,
    biaya_produksi: b.total_biaya_bahan
  }));
  for (const u of biayaUpdates) {
    const { error } = await supabase
      .from('produk')
      .update({ biaya_produksi: u.biaya_produksi })
      .eq('id', u.id);
    if (error) throw new Error(`update produk biaya_produksi: ${error.message}`);
  }

  console.log('== Order Produksi ==');
  const orderSpecs = [
    { produk: 'Meja Minimalis', jumlah: 3, status: 'Selesai' },
    { produk: 'Rak Dinding', jumlah: 5, status: 'Selesai' },
    { produk: 'Kursi Kayu', jumlah: 4, status: 'Selesai' },
    { produk: 'Meja TV', jumlah: 2, status: 'Selesai' },
    { produk: 'Meja Makan 6 Kursi', jumlah: 1, status: 'Dalam Proses' },
    { produk: 'Rak Buku', jumlah: 3, status: 'Dalam Proses' },
    { produk: 'Lemari TV', jumlah: 2, status: 'Dalam Proses' },
    { produk: 'Kursi Santai', jumlah: 2, status: 'Konfirmasi' },
    { produk: 'Meja Kerja', jumlah: 1, status: 'Konfirmasi' },
    { produk: 'Headboard', jumlah: 1, status: 'Konfirmasi' },
    { produk: 'Lemari Pakaian 2 Pintu', jumlah: 1, status: 'Draft' },
    { produk: 'Sofa Kayu 2 Dudukan', jumlah: 1, status: 'Draft' }
  ];

  const orderRows = [];
  for (let i = 0; i < orderSpecs.length; i++) {
    const spec = orderSpecs[i];
    const produk = byName(produkRows, spec.produk);
    const bom = bomRows.find((b) => b.produk_id === produk.id);
    orderRows.push(
      await insertOne('order_produksi', {
        kode: i + 1,
        bom_id: bom.id,
        produk_id: produk.id,
        jumlah_produk: spec.jumlah,
        components: bom.components,
        status: spec.status
      })
    );
  }

  console.log('== Vendor ==');
  await insertAll('vendor_individual', [
    { kode: 1, nama: 'Asep Wijaya', nama_perusahaan: 'CV Kayu Indah', alamat: 'Jl. Kenanga 10', telp: '081234567890', email: 'asep@example.com', posisi_pekerjaan: 'Owner' },
    { kode: 2, nama: 'Budi Santoso', nama_perusahaan: 'UD Mebel', alamat: 'Jl. Melati 5', telp: '081298765432', email: 'budi@example.com', posisi_pekerjaan: 'Purchasing' },
    { kode: 3, nama: 'Citra Dewi', nama_perusahaan: 'Toko Finishing', alamat: 'Jl. Tulip 8', telp: '081311223344', email: 'citra@example.com', posisi_pekerjaan: 'Owner' },
    { kode: 4, nama: 'Eko Prasetyo', nama_perusahaan: 'Pemasok Cat', alamat: 'Jl. Angsana 12', telp: '081322334455', email: 'eko@example.com', posisi_pekerjaan: 'Sales' },
    { kode: 5, nama: 'Fitri Handayani', nama_perusahaan: 'Pemasok Aksesoris', alamat: 'Jl. Cemara 3', telp: '081333445566', email: 'fitri@example.com', posisi_pekerjaan: 'Owner' }
  ]);
  const vendorCo = await insertAll('vendor_company', [
    { kode: 1, nama: 'PT Bahan Kayu', alamat: 'Jl. Industri 1', telp: '0215551234', email: 'sales@bahankayu.com' },
    { kode: 2, nama: 'CV Sumber Jati', alamat: 'Jl. Raya Bekasi Km 18', telp: '0215555678', email: 'order@sumberjati.co.id' },
    { kode: 3, nama: 'PT Multi Finishing', alamat: 'Jl. Gading 45', telp: '0215559012', email: 'marketing@multifinishing.com' }
  ]);
  const vendorCoByName = Object.fromEntries(vendorCo.map((r) => [r.nama, r.id]));

  const { data: vendorIndRows } = await supabase.from('vendor_individual').select('*');
  const vendorIndByName = Object.fromEntries(vendorIndRows.map((r) => [r.nama, r.id]));

  console.log('== Bills ==');
  function buildBillItems(spec, bahanByName) {
    return spec.map(([bahanNama, jumlah]) => {
      const b = bahanByName[bahanNama];
      const harga = Number(b.biaya);
      return { bahan_id: b.id, nama_bahan: b.nama, jumlah, harga_satuan: harga, subtotal: harga * jumlah };
    });
  }

  const billSpecs = [
    {
      ref: 'REF-2026-001',
      vendor_id: vendorCoByName['PT Bahan Kayu'],
      jenis: 'Transfer Bank',
      deadline: daysAgo(20),
      status: 'Paid',
      bayar: true,
      items: [['Kayu Jati', 25], ['Triplek 12mm', 12], ['Paku', 350], ['Sekrup', 100]]
    },
    {
      ref: 'REF-2026-002',
      vendor_id: vendorCoByName['CV Sumber Jati'],
      jenis: 'Transfer Bank',
      deadline: daysAgo(15),
      status: 'Paid',
      bayar: true,
      items: [['Kayu Mahoni', 18], ['Kayu Pinus', 8], ['Lem Kayu', 25]]
    },
    {
      ref: 'REF-2026-003',
      vendor_id: vendorCoByName['PT Multi Finishing'],
      jenis: 'Pembayaran Langsung',
      deadline: daysAgo(10),
      status: 'Paid',
      bayar: true,
      items: [['Cat Pernis', 12], ['Stain Kayu', 12], ['Minyak Kayu', 5], ['Ampelas', 40]]
    },
    {
      ref: 'REF-2026-004',
      vendor_id: vendorIndByName['Fitri Handayani'],
      jenis: 'Pembayaran Langsung',
      deadline: daysAgo(7),
      status: 'Paid',
      bayar: true,
      items: [['Engsel', 15], ['Handle', 12], ['Rel Laci', 8]]
    },
    {
      ref: 'REF-2026-005',
      vendor_id: vendorCoByName['CV Sumber Jati'],
      jenis: 'Tempo',
      deadline: daysAhead(7),
      status: 'Bill',
      bayar: false,
      items: [['Kayu Jati', 10], ['Kaca 5mm', 5]]
    },
    {
      ref: 'REF-2026-006',
      vendor_id: vendorCoByName['PT Bahan Kayu'],
      jenis: 'Tempo',
      deadline: daysAhead(14),
      status: 'Bill',
      bayar: false,
      items: [['Kayu Mahoni', 8], ['Triplek 12mm', 4]]
    },
    {
      ref: 'REF-2026-007',
      vendor_id: vendorIndByName['Asep Wijaya'],
      jenis: 'Pembayaran Langsung',
      deadline: daysAhead(21),
      status: 'Draft Bill',
      bayar: false,
      items: [['Kayu Pinus', 12]]
    },
    {
      ref: 'REF-2026-008',
      vendor_id: vendorCoByName['PT Multi Finishing'],
      jenis: 'Tempo',
      deadline: daysAhead(30),
      status: 'Draft Bill',
      bayar: false,
      items: [['Cat Pernis', 4], ['Stain Kayu', 3]]
    }
  ];

  const billRows = [];
  for (let i = 0; i < billSpecs.length; i++) {
    const spec = billSpecs[i];
    const items = buildBillItems(spec.items, bahanByName);
    billRows.push(
      await insertOne('bills', {
        kode: i + 1,
        vendor_id: spec.vendor_id,
        referensi_vendor: spec.ref,
        deadline_order: spec.deadline,
        accounting_date: spec.deadline,
        jenis_pembayaran: spec.jenis,
        items,
        total_biaya: billItemsTotal(items),
        status: spec.status
      })
    );
  }

  // Pembayaran bill (vendor_bill) untuk bill berstatus Paid
  for (const bill of billRows.filter((b) => b.status === 'Paid')) {
    await insertOne('vendor_bill', {
      bill_id: bill.id,
      jumlah_pembayaran: bill.total_biaya,
      payment_date: daysAgo(2)
    });
  }

  console.log('== Customer ==');
  await insertAll('customer_individual', [
    { kode: 1, nama: 'Rina Putri', nama_perusahaan: 'Rina Home', alamat: 'Jl. Anggrek 2', telp: '082112345678', email: 'rina@example.com', posisi_pekerjaan: 'Owner' },
    { kode: 2, nama: 'Dewi Lestari', nama_perusahaan: 'Dekorasi Dewi', alamat: 'Jl. Mawar 3', telp: '082198765432', email: 'dewi@example.com', posisi_pekerjaan: 'Buyer' },
    { kode: 3, nama: 'Agus Salim', nama_perusahaan: 'Rumah Agus', alamat: 'Jl. Kenanga 21', telp: '082145612389', email: 'agus@example.com', posisi_pekerjaan: 'Homeowner' },
    { kode: 4, nama: 'Maya Anjani', nama_perusahaan: 'Studio Maya', alamat: 'Jl. Melati 14', telp: '082177889900', email: 'maya@example.com', posisi_pekerjaan: 'Interior Designer' },
    { kode: 5, nama: 'Budi Hartono', nama_perusahaan: 'Kantor Hartono', alamat: 'Jl. Sudirman 88', telp: '082188990011', email: 'budi.hartono@example.com', posisi_pekerjaan: 'Office Manager' }
  ]);
  await insertAll('customer_company', [
    { kode: 1, nama: 'Toko Furnish', alamat: 'Jl. Besar 99', telp: '021777888', email: 'contact@furnish.com' },
    { kode: 2, nama: 'Hotel Kenangan', alamat: 'Jl. Pantai 12', telp: '021666777', email: 'procurement@hotelkenangan.co.id' },
    { kode: 3, nama: 'Interior Studio Nusantara', alamat: 'Jl. Raya Bintaro 5', telp: '021555666', email: 'sales@studionusantara.com' }
  ]);

  const { data: customerIndRows } = await supabase.from('customer_individual').select('*');
  const customerIndByName = Object.fromEntries(customerIndRows.map((r) => [r.nama, r.id]));

  const { data: customerCoRows } = await supabase.from('customer_company').select('*');
  const customerCoByName = Object.fromEntries(customerCoRows.map((r) => [r.nama, r.id]));

  const customerAll = [...(customerIndRows || []), ...(customerCoRows || [])];
  const customerById = Object.fromEntries(customerAll.map((c) => [c.id, c]));
  const snapshot = (id) => {
    const c = customerById[id] || {};
    return { nama: c.nama, email: c.email };
  };

  console.log('== Quotation -> Sales Order -> Payment ==');
  const quotationSpecs = [
    {
      kode: 1,
      customer: customerIndByName['Rina Putri'],
      payment_terms: '14 hari',
      convert: true,
      so_status: 'To Invoice',
      so_delivery: 'Sedang Dikirim',
      items: [['Meja Minimalis', 1]]
    },
    {
      kode: 2,
      customer: customerIndByName['Dewi Lestari'],
      payment_terms: '30 hari',
      convert: true,
      so_status: 'To Invoice',
      so_delivery: 'Sedang Dikirim',
      items: [['Rak Dinding', 2]]
    },
    {
      kode: 3,
      customer: customerIndByName['Agus Salim'],
      payment_terms: 'immediate payment',
      convert: true,
      so_status: 'To Invoice',
      so_delivery: 'Sedang Dikirim',
      items: [['Kursi Kayu', 2]]
    },
    {
      kode: 4,
      customer: customerCoByName['Toko Furnish'],
      payment_terms: '30 hari',
      convert: true,
      so_status: 'Fully Invoice',
      so_delivery: 'Terkirim',
      items: [['Meja TV', 1], ['Meja Minimalis', 1]]
    },
    {
      kode: 5,
      customer: customerIndByName['Maya Anjani'],
      payment_terms: '15 hari',
      convert: true,
      so_status: 'Fully Invoice',
      so_delivery: 'Terkirim',
      items: [['Rak Dinding', 2]]
    },
    {
      kode: 6,
      customer: customerCoByName['Hotel Kenangan'],
      payment_terms: '2 bulan',
      convert: false,
      items: [['Sofa Kayu 2 Dudukan', 2], ['Nakas', 2]]
    },
    {
      kode: 7,
      customer: customerCoByName['Interior Studio Nusantara'],
      payment_terms: '45 hari',
      convert: false,
      items: [['Meja Kerja', 1], ['Rak Buku', 1]]
    }
  ];

  const salesOrders = [];
  for (const spec of quotationSpecs) {
    const items = makeSalesItems(spec.items, produkByName);
    const total = itemsTotal(items);
    const q = await insertOne('quotation', {
      kode: spec.kode,
      customer_id: spec.customer,
      customer_snapshot: snapshot(spec.customer),
      expiration: spec.convert ? daysAgo(5) : daysAhead(14),
      payment_terms: spec.payment_terms,
      items,
      total_biaya: total,
      status: spec.convert ? 'Sales Order' : 'Quotation'
    });

    if (!spec.convert) continue;

    const so = await insertOne('sales_order', {
      kode: spec.kode,
      quotation_id: q.id,
      customer_id: spec.customer,
      customer_snapshot: snapshot(spec.customer),
      expiration: daysAgo(5),
      payment_terms: spec.payment_terms,
      items,
      total_biaya: total,
      status: spec.so_status,
      status_delivery: spec.so_delivery
    });
    salesOrders.push({ so, spec });
  }

  // Pembayaran & invoice
  for (const { so, spec } of salesOrders) {
    const lunas = spec.so_status === 'Fully Invoice';
    await insertOne('pembayaran_sales_order', {
      sales_order_id: so.id,
      journal: lunas ? 'Bank Transfer' : 'Cash',
      status: lunas ? 'Lunas' : 'Belum Lunas',
      jumlah_pembayaran: lunas ? so.total_biaya : 0,
      payment_date: lunas ? daysAgo(3) : null,
      catatan: lunas ? 'Lunas' : 'Belum dibayar'
    });

    if (lunas) {
      await insertOne('customer_invoice', {
        sales_order_id: so.id,
        jumlah_pembayaran: so.total_biaya,
        payment_date: daysAgo(3)
      });
    }
  }

  console.log('== Departemen & Karyawan ==');
  const departemenData = [
    { kode: 1, nama_departemen: 'Produksi', manager: 'Bambang' },
    { kode: 2, nama_departemen: 'Penjualan', manager: 'Siti' },
    { kode: 3, nama_departemen: 'Purchasing', manager: 'Doni' },
    { kode: 4, nama_departemen: 'Keuangan', manager: 'Maya' },
    { kode: 5, nama_departemen: 'HRD', manager: 'Yuni' }
  ];
  const departemenRows = await insertAll('departemen', departemenData);
  const depByName = Object.fromEntries(departemenRows.map((r) => [r.nama_departemen, r.id]));

  await insertAll('karyawan', [
    { kode: 1, departemen_id: depByName.Produksi, nama: 'Bambang', posisi: 'Kepala Produksi', telp: '08130000001', email: 'bambang@example.com', manager: 'Bambang' },
    { kode: 2, departemen_id: depByName.Produksi, nama: 'Joko', posisi: 'Operator', telp: '08130000002', email: 'joko@example.com', manager: 'Bambang' },
    { kode: 3, departemen_id: depByName.Produksi, nama: 'Andi', posisi: 'Operator', telp: '08130000003', email: 'andi@example.com', manager: 'Bambang' },
    { kode: 4, departemen_id: depByName.Produksi, nama: 'Hendra', posisi: 'Supervisor Produksi', telp: '08130000004', email: 'hendra@example.com', manager: 'Bambang' },
    { kode: 5, departemen_id: depByName.Penjualan, nama: 'Siti', posisi: 'Sales', telp: '08130000005', email: 'siti@example.com', manager: 'Siti' },
    { kode: 6, departemen_id: depByName.Penjualan, nama: 'Fajar', posisi: 'Sales', telp: '08130000006', email: 'fajar@example.com', manager: 'Siti' },
    { kode: 7, departemen_id: depByName.Penjualan, nama: 'Lia', posisi: 'Admin Penjualan', telp: '08130000007', email: 'lia@example.com', manager: 'Siti' },
    { kode: 8, departemen_id: depByName.Purchasing, nama: 'Doni', posisi: 'Purchasing', telp: '08130000008', email: 'doni@example.com', manager: 'Doni' },
    { kode: 9, departemen_id: depByName.Purchasing, nama: 'Rina', posisi: 'Admin Purchasing', telp: '08130000009', email: 'rina@example.com', manager: 'Doni' },
    { kode: 10, departemen_id: depByName.Keuangan, nama: 'Maya', posisi: 'Staff Keuangan', telp: '08130000010', email: 'maya@example.com', manager: 'Maya' },
    { kode: 11, departemen_id: depByName.Keuangan, nama: 'Citra', posisi: 'Staff Keuangan', telp: '08130000011', email: 'citra@example.com', manager: 'Maya' },
    { kode: 12, departemen_id: depByName.HRD, nama: 'Yuni', posisi: 'Staff HRD', telp: '08130000012', email: 'yuni@example.com', manager: 'Yuni' }
  ]);

  // Realign kode sequences after wipe & reseed (needs 007; skipped if missing)
  {
    const { error } = await supabase.rpc('reset_kode_sequences');
    console.log(error ? `  reset sequences: skipped (${error.message})` : '  reset sequences: ok');
  }

  // Ringkasan
  const summaryTables = [
    'kategori', 'bahan', 'produk', 'bom', 'order_produksi',
    'vendor_individual', 'vendor_company', 'bills', 'vendor_bill',
    'customer_individual', 'customer_company', 'quotation', 'sales_order',
    'customer_invoice', 'pembayaran_sales_order', 'departemen', 'karyawan'
  ];
  console.log('== Ringkasan ==');
  for (const t of summaryTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`  ${t}: error ${error.message}`);
    } else {
      console.log(`  ${t}: ${count} baris`);
    }
  }

  console.log('\nSeeding complete');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error', err);
  process.exit(1);
});
