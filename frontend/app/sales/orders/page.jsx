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

    const { error: insertError } = await supabase.from("customer_invoice").insert([
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
      <h2>Sales Orders</h2>
      <p>
        <a className="btn" href="/sales/orders/create">
          Buat Sales Order (from Quotation)
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>{o.customer_snapshot?.nama}</td>
              <td>{o.total_biaya}</td>
              <td>{o.status}</td>
              <td>
                <div className="action-buttons">
                  {o.status === "To Invoice" && (
                    <button className="btn" onClick={() => handleCreateInvoice(o)}>
                      Buat Invoice
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
