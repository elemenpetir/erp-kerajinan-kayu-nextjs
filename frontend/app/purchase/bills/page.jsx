"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function BillsList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus bill ini?")) return;
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Purchase - Bills</h2>
      <p>
        <a className="btn" href="/purchase/bills/create">
          Buat Bill
        </a>
      </p>
      <table>
        <thead>
          <tr>
            <th>Referensi Vendor</th>
            <th>Deadline</th>
            <th>Total</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>{b.referensi_vendor}</td>
              <td>{b.deadline_order}</td>
              <td>{b.total_biaya}</td>
              <td>
                <button onClick={() => handleDelete(b.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
