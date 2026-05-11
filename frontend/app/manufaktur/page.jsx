"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ManufakturList() {
  const [produk, setProduk] = useState([]);
  const [stokMap, setStokMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [bomMap, setBomMap] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchProduk(), fetchStok(), fetchBom()]);
    setLoading(false);
  }

  async function fetchBom() {
    const { data, error } = await supabase
      .from("bom")
      .select("produk_id, total_biaya_bahan");
    if (error) return;
    const map = {};
    (data || []).forEach((b) => {
      if (b.produk_id) map[b.produk_id] = b.total_biaya_bahan || 0;
    });
    setBomMap(map);
  }

  async function fetchProduk() {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setProduk(data || []);
  }

  async function fetchStok() {
    // Masuk: order_produksi status Selesai
    const { data: orderSelesai } = await supabase
      .from("order_produksi")
      .select("produk_id, jumlah_produk")
      .eq("status", "Selesai");

    // Keluar: sales_order status to invoice - fully invoice
    const { data: salesOrders } = await supabase
      .from("sales_order")
      .select("items, status")
      .in("status", ["To Invoice", "Fully Invoice"]);

    const stok = {};

    // Hitung stok masuk dari produksi selesai
    (orderSelesai || []).forEach((order) => {
      if (!order.produk_id) return;
      stok[order.produk_id] =
        (stok[order.produk_id] || 0) + (order.jumlah_produk || 0);
    });

    // Kurangi stok keluar dari sales order yang dikonfirmasi
    (salesOrders || []).forEach((so) => {
      (so.items || []).forEach((item) => {
        if (!item.produk_id) return;
        stok[item.produk_id] = (stok[item.produk_id] || 0) - (item.jumlah || 0);
      });
    });

    setStokMap(stok);
  }

  function getStokStyle(produkId) {
    const stok = stokMap[produkId];
    if (stok === undefined) return { value: 0, style: { color: "#64748b" } };
    if (stok <= 0)
      return { value: stok, style: { color: "#dc2626", fontWeight: "600" } };
    if (stok <= 5)
      return { value: stok, style: { color: "#d97706", fontWeight: "600" } };
    return { value: stok, style: { color: "#16a34a", fontWeight: "600" } };
  }

  return (
    <div>
      <h2>Manufaktur — Produk</h2>
      <p>
        <a className="btn" href="/manufaktur/create">
          Buat Produk
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
              <th>Harga Produksi</th>
              <th>Biaya Produksi</th>
              <th>Stok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {produk.map((p) => {
              const { value, style } = getStokStyle(p.id);
              return (
                <tr key={p.id}>
                  <td>PRD-{String(p.kode).padStart(4, "0")}</td>
                  <td>{p.nama}</td>
                  <td>{(p.harga_produksi || 0).toLocaleString("id-ID")}</td>
                  <td>{(bomMap[p.id] || 0).toLocaleString("id-ID")}</td>
                  <td style={style}>{value}</td>
                  <td>
                    <div className="action-buttons">
                      <a href={`/manufaktur/${p.id}`}>Lihat / Edit</a>
                    </div>
                  </td>
                </tr>
              );
            })}
            {produk.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 24px",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: 4,
                      }}
                    >
                      Belum ada produk
                    </p>
                    <p style={{ fontSize: 14 }}>
                      Klik "Buat Produk" untuk menambahkan produk pertama.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
