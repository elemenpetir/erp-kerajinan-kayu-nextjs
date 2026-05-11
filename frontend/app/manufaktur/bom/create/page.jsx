"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

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
      supabase.from("bahan").select("id,nama,harga,biaya"),
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
    if (components.length === 1) return;
    setComponents(components.filter((_, idx) => idx !== index));
  }

  const componentTotals = components.map((component) => {
    const bahan = bahanList.find((item) => item.id === component.bahanId);
    const qty = parseFloat(component.jumlah || 0);
    const biaya = parseFloat(bahan?.biaya || 0);
    return {
      ...component,
      nama: bahan?.nama || "",
      biaya,
      subtotal: qty * biaya,
    };
  });

  const totalBiayaBahan = componentTotals.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const selectedProduct = products.find((p) => p.id === produkId);
  const totalBiayaProduk = selectedProduct
    ? parseFloat(selectedProduct.harga_produksi || 0) *
      parseInt(jumlahProduk || "1", 10)
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const validComponents = componentTotals
      .filter((item) => item.bahanId && parseFloat(item.jumlah) > 0)
      .map((item) => ({
        bahan_id: item.bahanId,
        nama_bahan: item.nama,
        jumlah: parseFloat(item.jumlah || 0),
        harga: item.biaya,
        satuan: "pcs",
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
        {/* Info Produk */}
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
          <label>Jumlah Produk</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={jumlahProduk}
            onChange={(e) => setJumlahProduk(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Internal Referensi</label>
          <input
            className="form-input"
            value={internalReferensi}
            onChange={(e) => setInternalReferensi(e.target.value)}
            placeholder="Opsional"
          />
        </div>

        {/* Komponen Bahan */}
        <h3 style={{ marginTop: 24 }}>Komponen Bahan</h3>
        <table className="table-slate" style={{ marginBottom: 8 }}>
          <thead>
            <tr>
              <th>Bahan</th>
              <th>Jumlah</th>
              <th>Biaya Satuan</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {componentTotals.map((component, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={component.bahanId}
                    onChange={(e) =>
                      updateComponent(index, "bahanId", e.target.value)
                    }
                    required
                  >
                    <option value="">-- pilih bahan --</option>
                    {bahanList.map((bahan) => (
                      <option key={bahan.id} value={bahan.id}>
                        {bahan.nama}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={component.jumlah}
                    onChange={(e) =>
                      updateComponent(index, "jumlah", e.target.value)
                    }
                    style={{ width: 80 }}
                    required
                  />
                </td>
                <td>{formatRupiah(component.biaya)}</td>
                <td>{formatRupiah(component.subtotal)}</td>
                <td>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => removeComponent(index)}
                    disabled={components.length === 1}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={3}
                style={{ textAlign: "right", fontWeight: "bold" }}
              >
                Total Biaya Bahan
              </td>
              <td style={{ fontWeight: "bold" }}>
                {formatRupiah(totalBiayaBahan)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <button
          type="button"
          className="btn-table-action"
          onClick={addComponent}
        >
          + Tambah Bahan
        </button>

        {/* Summary */}
        <div
          style={{
            marginTop: 24,
            padding: "12px 16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            maxWidth: 360,
          }}
        >
          <p style={{ margin: "4px 0" }}>
            <strong>Total Biaya Bahan:</strong> {formatRupiah(totalBiayaBahan)}
          </p>
          <p style={{ margin: "4px 0" }}>
            <strong>Total Biaya Produk:</strong>{" "}
            {formatRupiah(totalBiayaProduk)}
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
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
