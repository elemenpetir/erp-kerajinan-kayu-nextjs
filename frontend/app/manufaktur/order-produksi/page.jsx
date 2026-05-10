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
      .select("*, produk:produk_id(nama), bom: bom_id(jumlah_produk,total_biaya_produk,total_biaya_bahan)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
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
                <td>{order.produk?.nama || "-"}</td>
                <td>{order.jumlah_produk}</td>
                <td>{order.status}</td>
                <td>{new Date(order.created_at).toLocaleDateString("id-ID")}</td>
                <td>
                  <div className="action-buttons">
                    <a href={`/manufaktur/order-produksi/${order.id}`}>Lihat</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
