"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function CreateOrderProduksi() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [produkId, setProdukId] = useState("");
  const [bomId, setBomId] = useState("");
  const [jumlahProduk, setJumlahProduk] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  async function fetchOptions() {
    const [{ data: produkData }, { data: bomData }] = await Promise.all([
      supabase.from("produk").select("id,nama"),
      supabase
        .from("bom")
        .select(
          "id,produk_id,jumlah_produk,internal_referensi,total_biaya_produk,total_biaya_bahan,components, produk:produk_id(nama)",
        ),
    ]);
    setProducts(produkData || []);
    setBoms(bomData || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const selectedBom = boms.find((bom) => bom.id === bomId);
    if (!produkId || !bomId || !selectedBom) {
      setMessage("Pilih produk dan BOM terlebih dahulu.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("order_produksi").insert([
      {
        produk_id: produkId,
        bom_id: bomId,
        jumlah_produk: parseInt(jumlahProduk || "1", 10),
        components: selectedBom.components || [],
        status: "Draft",
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/manufaktur/order-produksi");
    }
  }

  return (
    <div>
      <h2>Buat Order Produksi</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Produk</label>
          <select
            className="form-input"
            value={produkId}
            onChange={(e) => setProdukId(e.target.value)}
            required
          >
            <option value="">-- pilih produk --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>BOM</label>
          <select
            className="form-input"
            value={bomId}
            onChange={(e) => setBomId(e.target.value)}
            required
          >
            <option value="">-- pilih BOM --</option>
            {boms.map((bom) => (
              <option key={bom.id} value={bom.id}>
                {bom.produk?.nama || bom.id} - {bom.internal_referensi || "BOM"}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Jumlah Produksi</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={jumlahProduk}
            onChange={(e) => setJumlahProduk(e.target.value)}
            required
          />
        </div>

        {message && (
          <p style={{ color: "#dc2626", fontSize: 14, marginBottom: 8 }}>
            {message}
          </p>
        )}

        <button className="btn mb-0" type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
