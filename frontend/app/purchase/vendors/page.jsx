"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function VendorsList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    const { data } = await supabase
      .from("vendor_individual")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleDelete(id, nama) {
    if (!confirm(`Hapus vendor "${nama}"?`)) return;
    const { error } = await supabase
      .from("vendor_individual")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Gagal menghapus vendor.");
      console.error(error);
    } else {
      setItems((prev) => prev.filter((v) => v.id !== id));
    }
  }

  return (
    <div>
      <h2>Vendors</h2>
      <p>
        <a className="btn" href="/purchase/vendors/create">
          Tambah Vendor
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
          {items.map((v) => (
            <tr key={v.id}>
              <td>VND-{String(v.kode).padStart(4, "0")}</td>
              <td>{v.nama}</td>
              <td>{v.nama_perusahaan}</td>
              <td>{v.telp}</td>
              <td>{v.email}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/purchase/vendors/${v.id}`}>Lihat</a>
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(v.id, v.nama)}
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada vendor
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Tambah Vendor" untuk mendaftarkan vendor pertama.
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
