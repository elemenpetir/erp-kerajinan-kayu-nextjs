"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function BahanList() {
  const [items, setItems] = useState([]);
  const [stokMap, setStokMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchBahan(), fetchStok()]);
    setLoading(false);
  }

  async function fetchBahan() {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data || []);
  }

  async function fetchStok() {
    // Masuk: dari bills Paid
    const { data: billsPaid } = await supabase
      .from("bills")
      .select("items")
      .eq("status", "Paid");

    // Keluar: dari order_produksi Selesai
    const { data: orderSelesai } = await supabase
      .from("order_produksi")
      .select("components, jumlah_produk")
      .eq("status", "Dalam Proses");

    const stok = {};

    // Hitung stok masuk
    (billsPaid || []).forEach((bill) => {
      (bill.items || []).forEach((item) => {
        if (!item.bahan_id) return;
        stok[item.bahan_id] = (stok[item.bahan_id] || 0) + (item.jumlah || 0);
      });
    });

    // Kurangi stok keluar
    (orderSelesai || []).forEach((order) => {
      const qty = order.jumlah_produk || 1;
      (order.components || []).forEach((comp) => {
        if (!comp.bahan_id) return;
        stok[comp.bahan_id] =
          (stok[comp.bahan_id] || 0) - (comp.jumlah || 0) * qty;
      });
    });

    setStokMap(stok);
  }

  function getStokLabel(bahanId, stok) {
    if (stok === undefined) return { label: "0", style: { color: "#64748b" } };
    if (stok <= 0)
      return {
        label: stok.toString(),
        style: { color: "#dc2626", fontWeight: "600" },
      };
    if (stok <= 10)
      return {
        label: stok.toString(),
        style: { color: "#d97706", fontWeight: "600" },
      };
    return {
      label: stok.toString(),
      style: { color: "#16a34a", fontWeight: "600" },
    };
  }

  return (
    <div>
      <h2>Manufaktur — Bahan</h2>
      <p>
        <a className="btn" href="/manufaktur/bahan/create">
          Tambah Bahan
        </a>
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Biaya</th>
              <th>Harga</th>
              <th>Referensi</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => {
              const stok = stokMap[b.id];
              const { label, style } = getStokLabel(b.id, stok);
              return (
                <tr key={b.id}>
                  <td>BHN-{String(b.kode).padStart(4, "0")}</td>
                  <td>{b.nama}</td>
                  <td>{b.biaya}</td>
                  <td>{b.harga}</td>
                  <td>{b.internal_referensi}</td>
                  <td style={style}>{label}</td>
                  <td>
                    <div className="action-buttons">
                      <a href={`/manufaktur/bahan/${b.id}`}>Lihat</a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
