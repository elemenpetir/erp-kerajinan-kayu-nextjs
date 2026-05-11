"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "../../../lib/supabaseClient";

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

export default function ProdukDetail({ params }) {
  const { id } = use(params);
  const [produk, setProduk] = useState(null);
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingHarga, setEditingHarga] = useState(false);
  const [harga, setHarga] = useState("");

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchProduk(), fetchBom()]);
    setLoading(false);
  }

  async function fetchProduk() {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else {
      setProduk(data);
      setHarga(data.harga_produksi || "");
    }
  }

  async function fetchBom() {
    const { data } = await supabase
      .from("bom")
      .select("*")
      .eq("produk_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setBom(data || null);
  }

  async function handleUpdateHarga(e) {
    e.preventDefault();
    await supabase
      .from("produk")
      .update({ harga_produksi: parseFloat(harga || 0) })
      .eq("id", id);
    setEditingHarga(false);
    fetchProduk();
  }

  async function handleDelete() {
    if (!confirm("Hapus produk ini?")) return;
    await supabase.from("produk").delete().eq("id", id);
    window.location.href = "/manufaktur";
  }

  if (loading) return <p>Loading...</p>;
  if (!produk) return <p>Produk tidak ditemukan</p>;

  const hargaJual = parseFloat(produk.harga_produksi || 0);
  const biayaProduksi = bom ? parseFloat(bom.total_biaya_bahan || 0) : null;
  const margin = biayaProduksi !== null ? hargaJual - biayaProduksi : null;
  const isRugi = margin !== null && margin < 0;

  return (
    <div>
      <h2>Detail Produk</h2>
      <div className="detail-card">
        {/* Nama */}
        <p>
          <strong>Nama:</strong> {produk.nama}
        </p>

        {/* Harga Jual — inline edit */}
        <div style={{ marginBottom: 8 }}>
          <strong>Harga Jual:</strong>{" "}
          {editingHarga ? (
            <form
              onSubmit={handleUpdateHarga}
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <input
                type="number"
                min="0"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                style={{ width: 160 }}
                autoFocus
              />
              <button className="btn-table-action" type="submit">
                Simpan
              </button>
              <button
                className="btn-table-action"
                type="button"
                onClick={() => setEditingHarga(false)}
              >
                Batal
              </button>
            </form>
          ) : (
            <>
              {formatRupiah(hargaJual)}{" "}
              <button
                className="btn-table-action"
                style={{ marginLeft: 8 }}
                onClick={() => setEditingHarga(true)}
              >
                Edit
              </button>
            </>
          )}
        </div>

        {/* Biaya Produksi dari BOM */}
        <p>
          <strong>Biaya Produksi:</strong>{" "}
          {biayaProduksi !== null ? (
            formatRupiah(biayaProduksi)
          ) : (
            <span style={{ color: "#94a3b8" }}>Belum ada BOM</span>
          )}
        </p>

        {/* Margin */}
        {margin !== null && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 16px",
              borderRadius: 8,
              background: isRugi ? "#fff1f2" : "#f0fdf4",
              border: `1px solid ${isRugi ? "#fca5a5" : "#86efac"}`,
              display: "inline-block",
            }}
          >
            <strong>Margin:</strong>{" "}
            <span
              style={{ color: isRugi ? "#dc2626" : "#16a34a", fontWeight: 600 }}
            >
              {formatRupiah(margin)}
            </span>
            {isRugi && (
              <span style={{ marginLeft: 8, color: "#dc2626" }}>
                ⚠️ Harga jual lebih rendah dari biaya produksi!
              </span>
            )}
          </div>
        )}

        <div className="detail-actions">
          <a
            className="btn-outline"
            href={bom ? `/manufaktur/bom/${bom.id}` : `/manufaktur/bom/create?produk_id=${id}`}
          >
            {bom ? "Lihat BOM" : "+ Buat BOM"}
          </a>
          <button className="btn-danger mb-0" onClick={handleDelete}>
            Hapus Produk
          </button>
        </div>
      </div>
    </div>
  );
}
