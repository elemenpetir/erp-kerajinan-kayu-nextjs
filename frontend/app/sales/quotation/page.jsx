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
            <th>Kode</th>
            <th>Customer</th>
            <th>Payment Terms</th>
            <th>Total</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id}>
              <td>QUO-{String(q.kode).padStart(4, "0")}</td>
              <td>{q.customer_snapshot?.nama || "-"}</td>
              <td>{q.payment_terms || "-"}</td>
              <td>Rp {Number(q.total_biaya || 0).toLocaleString("id-ID")}</td>
              <td>{q.status}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/sales/quotation/${q.id}`}>Lihat</a>
                  {q.status !== "Sales Order" && (
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(q.id)}
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada quotation
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Buat Quotation" untuk membuat penawaran pertama.
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
