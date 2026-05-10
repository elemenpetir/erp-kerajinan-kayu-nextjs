"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function CreateBom() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [produkId, setProdukId] = useState("");
  const [jumlahProduk, setJumlahProduk] = useState("1");
  const [internalReferensi, setInternalReferensi] = useState("");
  const [components, setComponents] = useState([{ bahanId: "", jumlah: "1" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  async function fetchOptions() {
    const [{ data: produkData }, { data: bahanData }] = await Promise.all([
      supabase.from("produk").select("id,nama,harga_produksi"),
      supabase.from("bahan").select("id,nama,harga"),
    ]);
    setProducts(produkData || []);
    setBahanList(bahanData || []);
  }

  function updateComponent(index, field, value) {
    const next = [...components];
    next[index] = { ...next[index], [field]: value };
    setComponents(next);
  }

  function addComponent() {
    setComponents([...components, { bahanId: "", jumlah: "1" }]);
  }

  function removeComponent(index) {
    setComponents(components.filter((_, idx) => idx !== index));
  }

  const componentTotals = components.map((component) => {
    const bahan = bahanList.find((item) => item.id === component.bahanId);
    const qty = parseFloat(component.jumlah || 0);
    const harga = parseFloat(bahan?.harga || 0);
    return { ...component, nama: bahan?.nama || "", harga, subtotal: qty * harga };
  });

  const totalBiayaBahan = componentTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedProduct = products.find((p) => p.id === produkId);
  const totalBiayaProduk = selectedProduct
    ? parseFloat(selectedProduct.harga_produksi || 0) * parseInt(jumlahProduk || "1", 10)
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const validComponents = componentTotals
      .filter((item) => item.bahanId && parseFloat(item.jumlah) > 0)
      .map((item) => ({
        bahan_id: item.bahanId,
        nama: item.nama,
        jumlah: parseFloat(item.jumlah || 0),
        harga: item.harga,
      }));

    if (!produkId || validComponents.length === 0) {
      setMessage("Pilih produk dan setidaknya satu bahan.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("bom").insert([
      {
        produk_id: produkId,
        components: validComponents,
        jumlah_produk: parseInt(jumlahProduk || "1", 10),
        internal_referensi: internalReferensi || null,
        total_biaya_produk: totalBiayaProduk,
        total_biaya_bahan: totalBiayaBahan,
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/manufaktur/bom");
    }
  }

  return (
    <div>
      <h2>Buat BOM</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Produk</label>
          <br />
          <select value={produkId} onChange={(e) => setProdukId(e.target.value)} required>
            <option value="">-- pilih produk --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Jumlah Produk</label>
          <br />
          <input type="number" min="1" value={jumlahProduk} onChange={(e) => setJumlahProduk(e.target.value)} />
        </div>
        <div>
          <label>Internal Referensi</label>
          <br />
          <input value={internalReferensi} onChange={(e) => setInternalReferensi(e.target.value)} />
        </div>
        <div style={{ marginTop: 16 }}>
          <h3>Komponen Bahan</h3>
          {components.map((component, index) => (
            <div key={index} style={{ marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={component.bahanId}
                onChange={(e) => updateComponent(index, "bahanId", e.target.value)}
                required
              >
                <option value="">-- pilih bahan --</option>
                {bahanList.map((bahan) => (
                  <option key={bahan.id} value={bahan.id}>
                    {bahan.nama}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="1"
                value={component.jumlah}
                onChange={(e) => updateComponent(index, "jumlah", e.target.value)}
                placeholder="Jumlah"
                required
              />
              <button type="button" className="btn-outline" onClick={() => removeComponent(index)}>
                Hapus
              </button>
            </div>
          ))}
          <button type="button" className="btn" onClick={addComponent}>
            Tambah Bahan
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <p>Total Biaya Bahan: {totalBiayaBahan}</p>
          <p>Total Biaya Produk: {totalBiayaProduk}</p>
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
