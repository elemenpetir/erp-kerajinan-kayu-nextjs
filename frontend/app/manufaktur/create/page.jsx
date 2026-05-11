"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function CreateProduk() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga_produksi: parseFloat(harga || 0),
        biaya_produksi: 0, // akan dihitung otomatis dari BOM
      },
    ]);
    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/manufaktur");
    }
  }

  return (
    <div>
      <h2>Buat Produk</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nama Produk</label>
          <input
            className="form-input"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Harga Jual</label>
          <input
            className="form-input"
            type="number"
            min="0"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            placeholder="Rp 0"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          {message && (
            <span style={{ marginLeft: 12, color: "red" }}>{message}</span>
          )}
        </div>
      </form>
    </div>
  );
}
