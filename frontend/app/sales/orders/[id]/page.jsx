"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function SalesOrderDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales_order")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setOrder(data);
    setLoading(false);
  }

  async function handleCreateInvoice() {
    if (!confirm("Buat invoice untuk Sales Order ini?")) return;
    const today = new Date().toISOString().split("T")[0];

    const { error: updateError } = await supabase
      .from("sales_order")
      .update({ status: "Fully Invoice" })
      .eq("id", id);
    if (updateError) {
      alert("Gagal update: " + updateError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("customer_invoice")
      .insert([
        {
          sales_order_id: id,
          jumlah_pembayaran: order.total_biaya,
          payment_date: today,
        },
      ]);
    if (insertError) {
      alert("Gagal buat invoice: " + insertError.message);
      return;
    }

    alert("Invoice berhasil dibuat!");
    fetchData();
  }

  async function handleMarkDelivered() {
    if (!confirm("Tandai pengiriman sebagai Terkirim?")) return;
    const { error } = await supabase
      .from("sales_order")
      .update({ status_delivery: "Terkirim" })
      .eq("id", id);
    if (error) alert("Gagal: " + error.message);
    else fetchData();
  }

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Sales Order tidak ditemukan</p>;

  return (
    <>
      <style>{`
        @media print {
          nav, aside, .no-print { display: none !important; }
          body { background: white !important; }
          .detail-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          button, a { display: none !important; }
        }
      `}</style>
      <div className="detail-card">
        <h2>Detail Sales Order</h2>
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>Customer:</strong> {order.customer_snapshot?.nama || "-"}
          </p>
          <p>
            <strong>Email:</strong> {order.customer_snapshot?.email || "-"}
          </p>
          <p>
            <strong>Payment Terms:</strong> {order.payment_terms || "-"}
          </p>
          <p>
            <strong>Expiration:</strong> {order.expiration || "-"}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Status Pengiriman:</strong> {order.status_delivery || "-"}
          </p>
          <p>
            <strong>Tanggal:</strong>{" "}
            {order.created_at
              ? new Date(order.created_at).toLocaleDateString("id-ID")
              : "-"}
          </p>
        </div>
        <h3>Daftar Produk</h3>
        <table className="table-slate">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Tidak ada item
                </td>
              </tr>
            )}
            {(order.items || []).map((it, idx) => (
              <tr key={idx}>
                <td>{it.nama_produk}</td>
                <td>{it.jumlah}</td>
                <td>
                  Rp {Number(it.satuan_biaya || 0).toLocaleString("id-ID")}
                </td>
                <td>
                  Rp {Number(it.total_biaya || 0).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
            <tr>
              <td
                colSpan={3}
                style={{ textAlign: "right", fontWeight: "bold" }}
              >
                Total
              </td>
              <td>
                <strong>
                  Rp {Number(order.total_biaya || 0).toLocaleString("id-ID")}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <a className="btn-outline no-print mb-0" href="/sales/orders">
            ← Kembali
          </a>
          <div style={{ display: "flex", gap: 12 }} className="no-print">
            {/* Tombol independen — cek status_delivery */}
            {order.status_delivery === "Sedang Dikirim" && (
              <button className="btn-outline mb-0" onClick={handleMarkDelivered}>
                ✓ Tandai Terkirim
              </button>
            )}

            {/* Tombol independen — cek status billing */}
            {order.status === "To Invoice" && (
              <button className="btn mb-0" onClick={handleCreateInvoice}>
                Buat Invoice
              </button>
            )}

            <button className="btn-outline mb-0" onClick={() => window.print()}>
              🖨️ Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
