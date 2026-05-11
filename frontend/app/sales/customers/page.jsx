"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function CustomersList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("customer_individual")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus customer ini?")) return;
    const { error } = await supabase
      .from("customer_individual")
      .delete()
      .eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Customers</h2>
      <p>
        <a className="btn" href="/sales/customers/create">
          Tambah Customer
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Perusahaan</th>
            <th>Telp</th>
            <th>Email</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td>CUST-{String(c.kode).padStart(4, "0")}</td>
              <td>{c.nama}</td>
              <td>{c.nama_perusahaan}</td>
              <td>{c.telp}</td>
              <td>{c.email}</td>
              <td>
                <div className="action-buttons">
                  <a
                    className="btn-table-action"
                    href={`/sales/customers/${c.id}`}
                  >
                    Lihat
                  </a>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(c.id)}
                  >
                    Hapus
                  </button>
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada customer
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Tambah Customer" untuk mendaftarkan customer pertama.
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
