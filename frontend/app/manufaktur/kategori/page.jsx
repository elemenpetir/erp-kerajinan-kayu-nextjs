"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function KategoriPage() {
  const [items, setItems] = useState([]);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("kategori")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { error } = await supabase.from("kategori").insert([{ nama }]);
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setNama("");
      setMessage("");
      fetchData();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus kategori ini?")) return;
    const { error } = await supabase.from("kategori").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Manufaktur — Kategori</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 12 }}>
        <input
          placeholder="Nama kategori"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
        <button className="btn" type="submit" style={{ marginLeft: 8 }}>
          Tambah Kategori
        </button>
        <span style={{ marginLeft: 12 }}>{message}</span>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((kategori) => (
              <tr key={kategori.id}>
                <td>{kategori.nama}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleDelete(kategori.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
