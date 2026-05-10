"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

const PAYMENT_TERMS = [
  "immadiate payment",
  "15 hari",
  "30 hari",
  "45 hari",
  "2 bulan",
];

export default function CreateQuotation() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [expiration, setExpiration] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRefs();
  }, []);

  async function fetchRefs() {
    const { data: c } = await supabase.from("customer_individual").select("*");
    const { data: p } = await supabase.from("produk").select("*");
    setCustomers(c || []);
    setProdukList(p || []);
  }

  function addItem(produkId) {
    if (!produkId) return;
    const p = produkList.find((pp) => pp.id === produkId);
    if (!p) return;
    const newItem = {
      produk_id: p.id,
      nama_produk: p.nama,
      jumlah: 1,
      satuan_biaya: p.harga_produksi || 0,
      total_biaya: p.harga_produksi || 0,
    };
    const updated = [...items, newItem];
    setItems(updated);
    recalc(updated);
  }

  function updateJumlah(idx, jumlah) {
    const updated = items.map((it, i) => {
      if (i !== idx) return it;
      const qty = parseFloat(jumlah) || 0;
      return { ...it, jumlah: qty, total_biaya: qty * it.satuan_biaya };
    });
    setItems(updated);
    recalc(updated);
  }

  function removeItem(idx) {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    recalc(updated);
  }

  function recalc(list) {
    const t = list.reduce((s, i) => s + parseFloat(i.total_biaya || 0), 0);
    setTotal(t);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const customer = customers.find((c) => c.id === customerId);
    const { error } = await supabase.from("quotation").insert([
      {
        customer_id: customerId || null,
        customer_snapshot: { nama: customer?.nama, email: customer?.email },
        expiration: expiration || null,
        payment_terms: paymentTerms || null,
        items,
        total_biaya: total,
        status: "Quotation",
      },
    ]);
    if (error) alert("Gagal simpan: " + error.message);
    else router.push("/sales/quotation");
  }

  function addItem(produkId) {
    if (!produkId) return;
    const p = produkList.find((pp) => pp.id === produkId);
    if (!p) return;

    // Cek apakah produk sudah ada di items
    const existingIdx = items.findIndex((it) => it.produk_id === produkId);

    if (existingIdx !== -1) {
      // Kalau sudah ada, tambah jumlahnya
      updateJumlah(existingIdx, items[existingIdx].jumlah + 1);
      return;
    }

    // Kalau belum ada, tambah baris baru
    const newItem = {
      produk_id: p.id,
      nama_produk: p.nama,
      jumlah: 1,
      satuan_biaya: p.harga_produksi || 0,
      total_biaya: p.harga_produksi || 0,
    };
    const updated = [...items, newItem];
    setItems(updated);
    recalc(updated);
  }

  return (
    <div>
      <h2>Buat Quotation</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer</label>
          <select
            className="form-input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">-- pilih --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Expiration Date</label>
          <input
            className="form-input"
            type="date"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Payment Terms</label>
          <select
            className="form-input"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
          >
            <option value="">-- pilih --</option>
            {PAYMENT_TERMS.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tambah Produk</label>
          <select
            className="form-input"
            onChange={(e) => {
              addItem(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">-- pilih produk --</option>
            {produkList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama} — Rp {p.harga_produksi?.toLocaleString("id-ID")}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <table className="table-slate">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Jumlah</th>
                <th>Harga Satuan</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", color: "#94a3b8" }}
                  >
                    Belum ada produk ditambahkan
                  </td>
                </tr>
              )}
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.nama_produk}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={it.jumlah}
                      onChange={(e) => updateJumlah(idx, e.target.value)}
                      style={{ width: 70 }}
                    />
                  </td>
                  <td>Rp {it.satuan_biaya?.toLocaleString("id-ID")}</td>
                  <td>Rp {it.total_biaya?.toLocaleString("id-ID")}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(idx)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {items.length > 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Total
                  </td>
                  <td colSpan={2}>
                    <strong>Rp {total.toLocaleString("id-ID")}</strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn" type="submit">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
