"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function OrderProduksiList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_produksi")
      .select(
        "*, produk:produk_id(nama), bom:bom_id(jumlah_produk,total_biaya_produk,total_biaya_bahan)",
      )
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus order produksi ini?")) return;
    const { error } = await supabase
      .from("order_produksi")
      .delete()
      .eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Order Produksi</h2>
      <p>
        <a className="btn" href="/manufaktur/order-produksi/create">
          Buat Order
        </a>
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Produk</th>
              <th>Jumlah</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id}>
                <td>ORP-{String(order.kode).padStart(4, "0")}</td>
                <td>{order.produk?.nama || "-"}</td>
                <td>{order.jumlah_produk}</td>
                <td>{order.status}</td>
                <td>
                  {new Date(order.created_at).toLocaleDateString("id-ID")}
                </td>
                <td>
                  <div className="action-buttons">
                    <a href={`/manufaktur/order-produksi/${order.id}`}>Lihat</a>
                    {order.status === "Draft" && (
                      <button
                        className="btn-danger"
                        style={{ height: 32, padding: "0 12px" }}
                        onClick={() => handleDelete(order.id)}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 24px",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🏭</div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: 4,
                      }}
                    >
                      Belum ada order produksi
                    </p>
                    <p style={{ fontSize: 14 }}>
                      Klik "Buat Order" untuk memulai order produksi pertama.
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
