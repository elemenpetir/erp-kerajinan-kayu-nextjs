"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../../../lib/supabase/client";

const statusFlow = ["Draft", "Konfirmasi", "Dalam Proses", "Selesai"];

export default function OrderProduksiDetail({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_produksi")
      .select(
        "*, produk:produk_id(nama), bom:bom_id(id, kode, internal_referensi, jumlah_produk, total_biaya_produk, total_biaya_bahan, components)",
      )
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setOrder(data);
    setLoading(false);
  }

  async function advanceStatus() {
    if (!order) return;
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIndex + 1];
    setUpdating(true);
    const { error } = await supabase
      .from("order_produksi")
      .update({ status: nextStatus })
      .eq("id", id);
    if (error) alert("Gagal ubah status: " + error.message);
    else fetchOrder();
    setUpdating(false);
  }

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order Produksi tidak ditemukan</p>;

  const currentIndex = statusFlow.indexOf(order.status);
  const canAdvance = currentIndex >= 0 && currentIndex < statusFlow.length - 1;
  const nextLabel = canAdvance
    ? `Ubah ke ${statusFlow[currentIndex + 1]}`
    : "Selesai";

  return (
    <div className="detail-card">
      <h2>Order Produksi</h2>
      <p>Produk: {order.produk?.nama || "-"}</p>
      <p>Jumlah: {order.jumlah_produk}</p>
      <p>Status: {order.status}</p>
      <p>
        Tanggal:{" "}
        {order.created_at
          ? new Date(order.created_at).toLocaleDateString("id-ID")
          : "-"}
      </p>
      <p>
        BOM:{" "}
        {order.bom?.internal_referensi ||
          order.bom?.kode ||
          order.bom?.id ||
          "-"}
      </p>
      <div className="detail-actions">
        <button
          className="btn"
          onClick={advanceStatus}
          disabled={!canAdvance || updating}
        >
          {updating ? "Memproses..." : nextLabel}
        </button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Komponen</h3>
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jumlah</th>
              <th>Harga</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.components || []).map((item, index) => {
              const jumlahTotal =
                (item.jumlah || 0) * (order.jumlah_produk || 1);
              const subtotal = (item.harga || 0) * jumlahTotal;
              return (
                <tr key={index}>
                  <td>{item.nama_bahan}</td>
                  <td>{jumlahTotal}</td>
                  <td>{(item.harga || 0).toLocaleString("id-ID")}</td>
                  <td>{subtotal.toLocaleString("id-ID")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
