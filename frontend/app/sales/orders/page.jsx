"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function OrdersList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("sales_order")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleCreateInvoice(order) {
    if (!confirm("Buat invoice untuk Sales Order ini?")) return;
    const today = new Date().toISOString().split("T")[0];

    const { error: updateError } = await supabase
      .from("sales_order")
      .update({ status: "Fully Invoice" })
      .eq("id", order.id);
    if (updateError) {
      alert("Gagal update status: " + updateError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from("customer_invoice")
      .insert([
        {
          sales_order_id: order.id,
          jumlah_pembayaran: order.total_biaya,
          payment_date: today,
        },
      ]);
    if (insertError) {
      alert("Gagal membuat invoice: " + insertError.message);
      return;
    }

    alert("Invoice berhasil dibuat.");
    fetchData();
  }

  return (
    <div>
      <h2>Sales Orders</h2>{" "}
      {/* ← hapus baris h2 Detail Sales Order yang nyasar */}
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Customer</th>
            <th>Payment Terms</th>
            <th>Total</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>SO-{String(o.kode).padStart(4, "0")}</td>
              <td>{o.customer_snapshot?.nama || "-"}</td>
              <td>{o.payment_terms || "-"}</td>
              <td>Rp {Number(o.total_biaya || 0).toLocaleString("id-ID")}</td>
              <td>{o.status}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/sales/orders/${o.id}`}>Lihat</a>
                  {o.status === "To Invoice" && (
                    <button
                      className="btn-danger"
                      onClick={() => handleCreateInvoice(o)}
                    >
                      Buat Invoice
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada sales order
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Sales order akan muncul setelah quotation dikonfirmasi.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
