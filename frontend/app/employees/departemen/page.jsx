"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function DepartemenPage() {
  const [items, setItems] = useState([]);
  const [karyawanList, setKaryawanList] = useState([]);
  const [nama, setNama] = useState("");
  const [manager, setManager] = useState("");
  const [editId, setEditId] = useState(null);
  const [editManager, setEditManager] = useState("");

  useEffect(() => {
    fetchData();
    fetchKaryawan();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("departemen")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function fetchKaryawan() {
    const { data } = await supabase
      .from("karyawan")
      .select("id, nama")
      .order("nama", { ascending: true });
    setKaryawanList(data || []);
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

  function startEdit(d) {
    setEditId(d.id);
    setEditManager(d.manager || "");
  }

  function cancelEdit() {
    setEditId(null);
    setEditManager("");
  }

  async function handleSaveManager(id) {
    const { error } = await supabase
      .from("departemen")
      .update({ manager: editManager || null })
      .eq("id", id);
    if (error) alert("Gagal update: " + error.message);
    else {
      cancelEdit();
      fetchData();
    }
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
        <select
          value={manager}
          onChange={(e) => setManager(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          <option value="">— Pilih Manager —</option>
          {karyawanList.map((k) => (
            <option key={k.id} value={k.nama}>
              {k.nama}
            </option>
          ))}
        </select>
        <button className="btn mb-0" style={{ marginLeft: 8 }}>
          Tambah
        </button>
      </form>

      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama</th>
            <th>Manager</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={3}>Belum ada departemen.</td>
            </tr>
          ) : (
            items.map((d) => (
              <tr key={d.id}>
                <td>DEPT-{String(d.id).slice(0, 8)}</td>
                <td>{d.nama_departemen}</td>
                <td>
                  {editId === d.id ? (
                    <select
                      value={editManager}
                      onChange={(e) => setEditManager(e.target.value)}
                    >
                      <option value="">— Kosongkan —</option>
                      {karyawanList.map((k) => (
                        <option key={k.id} value={k.nama}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  ) : (
                    d.manager || "-"
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {editId === d.id ? (
                      <>
                        <button
                          className="btn-table-action"
                          onClick={() => handleSaveManager(d.id)}
                        >
                          Simpan
                        </button>
                        <button
                          className="btn-table-action"
                          onClick={cancelEdit}
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-table-action"
                        onClick={() => startEdit(d)}
                      >
                        Edit Manager
                      </button>
                    )}
                    <button onClick={() => handleDelete(d.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))
          )}
          {items.length === 0 && (
            <tr>
              <td colSpan={4}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada departemen
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Tambah Departemen" untuk membuat struktur organisasi.
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
