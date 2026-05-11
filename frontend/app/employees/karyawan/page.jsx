"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function KaryawanList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("karyawan")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  return (
    <div>
      <h2>Karyawan</h2>
      <p>
        <a className="btn" href="/employees/karyawan/create">
          Tambah Karyawan
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Posisi</th>
            <th>Telp</th>
            <th>Email</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((k) => (
            <tr key={k.id}>
              <td>EMP-{String(k.kode).padStart(4, "0")}</td>
              <td>{k.nama}</td>
              <td>{k.posisi}</td>
              <td>{k.telp}</td>
              <td>{k.email}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/employees/karyawan/${k.id}`}>Lihat / Edit</a>
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
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada karyawan
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Tambah Karyawan" untuk mendaftarkan karyawan pertama.
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
