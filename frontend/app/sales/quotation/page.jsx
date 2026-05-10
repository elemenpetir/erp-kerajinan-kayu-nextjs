"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function QuotationList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("quotation")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus quotation ini?")) return;
    const { error } = await supabase.from("quotation").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Quotation</h2>
      <p>
        <a className="btn" href="/sales/quotation/create">
          Buat Quotation
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
          {items.map((q) => (
            <tr key={q.id}>
              <td>{q.customer_snapshot?.nama}</td>
              <td>{q.total_biaya}</td>
              <td>{q.status}</td>
              <td>
                <div className="action-buttons">
                  <button onClick={() => handleDelete(q.id)}>Hapus</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
