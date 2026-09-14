"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase/client";

export default function CustomerDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [editing, setEditing] = useState(false);
  const [nama, setNama] = useState("");
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telp, setTelp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    const { data } = await supabase
      .from("customer_individual")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setItem(data);
      setNama(data.nama || "");
      setNamaPerusahaan(data.nama_perusahaan || "");
      setAlamat(data.alamat || "");
      setTelp(data.telp || "");
      setEmail(data.email || "");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("customer_individual")
      .update({ nama, nama_perusahaan: namaPerusahaan, alamat, telp, email })
      .eq("id", id);
    if (error) alert("Gagal update: " + error.message);
    else {
      setEditing(false);
      fetchItem();
    }
  }

  async function handleDelete() {
    if (!confirm("Hapus customer ini?")) return;
    const { error } = await supabase
      .from("customer_individual")
      .delete()
      .eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else router.push("/sales/customers");
  }

  if (!item) return <p>Loading...</p>;

  return (
    <div className="detail-card">
      {!editing ? (
        <div>
          <h2>{item.nama}</h2>
          <p>Perusahaan: {item.nama_perusahaan}</p>
          <p>Alamat: {item.alamat}</p>
          <p>Telp: {item.telp}</p>
          <p>Email: {item.email}</p>
          <div className="detail-actions">
            <button className="btn-outline" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <h2>Edit Customer</h2>
          <div>
            <label>Nama</label>
            <br />
            <input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Perusahaan</label>
            <br />
            <input
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
            />
          </div>
          <div>
            <label>Alamat</label>
            <br />
            <input value={alamat} onChange={(e) => setAlamat(e.target.value)} />
          </div>
          <div>
            <label>Telp</label>
            <br />
            <input value={telp} onChange={(e) => setTelp(e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <br />
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="detail-actions">
            <button className="btn" type="submit">
              Simpan
            </button>
            <button className="btn-outline" type="button" onClick={() => setEditing(false)}>
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
