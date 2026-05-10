"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function VendorDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    const { data, error } = await supabase
      .from("vendor_individual")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setItem(data || null);
  }

  async function handleDelete() {
    if (!window.confirm("Yakin ingin menghapus vendor ini?")) return;

    setDeleting(true);
    const { error } = await supabase
      .from("vendor_individual")
      .delete()
      .eq("id", id);
    if (error) {
      console.error(error);
      alert("Gagal menghapus vendor. Silakan coba lagi.");
      setDeleting(false);
      return;
    }

    router.push("/purchase/vendors");
  }

  if (!item) return <p>Loading...</p>;

  return (
    <div className="detail-card">
      <h2>{item.nama}</h2>
      <p>Perusahaan: {item.nama_perusahaan}</p>
      <p>Alamat: {item.alamat}</p>
      <p>Telp: {item.telp}</p>
      <p>Email: {item.email}</p>
      <div className="detail-actions">
        <button className="btn-danger" type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? "Menghapus..." : "Hapus Vendor"}
        </button>
      </div>
    </div>
  );
}
