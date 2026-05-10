"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function CreateBahan() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [biaya, setBiaya] = useState("");
  const [harga, setHarga] = useState("");
  const [internalReferensi, setInternalReferensi] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("bahan").insert([
      {
        nama,
        biaya: parseFloat(biaya || 0),
        harga: parseFloat(harga || 0),
        internal_referensi: internalReferensi || null,
      },
    ]);
    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/manufaktur/bahan");
    }
  }

  return (
    <div>
      <h2>Buat Bahan</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nama</label>
          <br />
          <input value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>
        <div>
          <label>Biaya</label>
          <br />
          <input value={biaya} onChange={(e) => setBiaya(e.target.value)} />
        </div>
        <div>
          <label>Harga</label>
          <br />
          <input value={harga} onChange={(e) => setHarga(e.target.value)} />
        </div>
        <div>
          <label>Internal Referensi</label>
          <br />
          <input value={internalReferensi} onChange={(e) => setInternalReferensi(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <span style={{ marginLeft: 12 }}>{message}</span>
        </div>
      </form>
    </div>
  );
}
