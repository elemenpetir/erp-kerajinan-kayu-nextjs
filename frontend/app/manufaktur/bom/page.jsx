"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function BomList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("bom")
      .select("*, produk:produk_id(nama)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setItems(data || []);
    setLoading(false);
  }

  return (
    <div>
      <h2>Manufaktur — BOM</h2>
      <p>
        <a className="btn" href="/manufaktur/bom/create">
          Tambah BOM
        </a>
      </p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Produk</th>
              <th>Total Biaya Produk</th>
              <th>Total Biaya Bahan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>BOM-{String(b.kode).padStart(4, '0')}</td>
                <td>{b.produk?.nama || "-"}</td>
                <td>{b.total_biaya_produk}</td>
                <td>{b.total_biaya_bahan}</td>
                <td>
                  <div className="action-buttons">
                    <a href={`/manufaktur/bom/${b.id}`}>Lihat</a>
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
