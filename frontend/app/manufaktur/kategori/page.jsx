"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function KategoriPage() {
  const [items, setItems] = useState([]);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("kategori")
      .select("*")
      .order("nama", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Gagal mengambil data");
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();

    const trimmedNama = nama.trim();

    if (!trimmedNama) {
      setMessage("Nama kategori wajib diisi");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("kategori").insert([
      {
        nama: trimmedNama,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        setMessage("Kategori sudah ada");
      } else {
        setMessage("Error: " + error.message);
      }

      setSubmitting(false);
      return;
    }

    setNama("");
    setMessage("");

    await fetchData();

    setSubmitting(false);
  }

  async function handleDelete(id) {
    const confirmed = confirm("Hapus kategori ini?");

    if (!confirmed) return;

    const { error } = await supabase.from("kategori").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }

    fetchData();
  }

  return (
    <div>
      <h2>Manufaktur — Kategori</h2>

      <form
        onSubmit={handleCreate}
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          className="form-input"
          placeholder="Nama kategori"
          value={nama}
          onChange={(e) => {
            setNama(e.target.value);
            setMessage("");
          }}
          required
          style={{ height: "42px" }}
        />

        <button className="btn mb-0" type="submit" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Tambah Kategori"}
        </button>

        {message && (
          <span
            style={{
              color: "#dc2626",
              fontSize: 14,
            }}
          >
            {message}
          </span>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nama</th>
              <th style={{ width: 120 }}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={2}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "48px 24px",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
                    <p
                      style={{
                        fontWeight: 600,
                        color: "#64748b",
                        marginBottom: 4,
                      }}
                    >
                      Belum ada kategori
                    </p>
                    <p style={{ fontSize: 14 }}>
                      Tambah kategori pertama menggunakan form di atas.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((kategori) => (
                <tr key={kategori.id}>
                  <td>{kategori.nama}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(kategori.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
