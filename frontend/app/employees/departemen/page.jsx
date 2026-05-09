"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function DepartemenPage() {
  const [items, setItems] = useState([]);
  const [nama, setNama] = useState("");
  const [manager, setManager] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("departemen")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleCreate(e) {
    e.preventDefault();
    await supabase
      .from("departemen")
      .insert([{ nama_departemen: nama, manager }]);
    setNama("");
    setManager("");
    fetchData();
  }

  async function handleDelete(id) {
    if (!confirm("Hapus departemen ini?")) return;
    const { error } = await supabase.from("departemen").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Departemen</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 12 }}>
        <input
          placeholder="Nama Departemen"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
        <input
          placeholder="Manager"
          value={manager}
          onChange={(e) => setManager(e.target.value)}
          style={{ marginLeft: 8 }}
        />
        <button className="btn" style={{ marginLeft: 8 }}>
          Tambah
        </button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Manager</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td>{d.nama_departemen}</td>
              <td>{d.manager}</td>
              <td>
                <button onClick={() => handleDelete(d.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
