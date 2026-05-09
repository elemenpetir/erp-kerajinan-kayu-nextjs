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
      <table>
        <thead>
          <tr>
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
              <td>{c.nama}</td>
              <td>{c.nama_perusahaan}</td>
              <td>{c.telp}</td>
              <td>{c.email}</td>
              <td>
                <a href={`/sales/customers/${c.id}`}>Lihat</a>
                {" | "}
                <button onClick={() => handleDelete(c.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
