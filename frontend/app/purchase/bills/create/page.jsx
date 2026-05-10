"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";

const emptyItem = {
  bahan_id: "",
  nama_bahan: "",
  jumlah: 1,
  harga_satuan: 0,
  subtotal: 0,
};

export default function CreateBill() {
  const [vendorId, setVendorId] = useState("");
  const [vendors, setVendors] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [referensi, setReferensi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [jenisPembayaran, setJenisPembayaran] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);

  useEffect(() => {
    fetchVendors();
    fetchBahan();
  }, []);

  async function fetchVendors() {
    const { data } = await supabase
      .from("vendor_individual")
      .select("id, nama");
    setVendors(data || []);
  }

  async function fetchBahan() {
    const { data } = await supabase.from("bahan").select("id, nama, biaya");
    setBahanList(data || []);
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "bahan_id") {
      const bahan = bahanList.find((b) => b.id === value);
      if (bahan) {
        updated[index].nama_bahan = bahan.nama;
        updated[index].harga_satuan = bahan.biaya || 0;
      }
    }

    const jumlah = parseFloat(updated[index].jumlah) || 0;
    const harga = parseFloat(updated[index].harga_satuan) || 0;
    updated[index].subtotal = jumlah * harga;

    setItems(updated);
  }

  function addItem() {
    setItems([...items, { ...emptyItem }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const totalBiaya = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  async function handleSubmit(e) {
    e.preventDefault();

    const itemsToSave = items
      .filter((item) => item.bahan_id)
      .map((item) => ({
        bahan_id: item.bahan_id,
        nama_bahan: item.nama_bahan,
        jumlah: parseFloat(item.jumlah),
        harga_satuan: parseFloat(item.harga_satuan),
        subtotal: item.subtotal,
      }));

    if (itemsToSave.length === 0) {
      alert("Tambahkan minimal satu bahan.");
      return;
    }

    const { error } = await supabase.from("bills").insert([
      {
        vendor_id: vendorId || null,
        referensi_vendor: referensi,
        deadline_order: deadline || null,
        jenis_pembayaran: jenisPembayaran || null,
        items: itemsToSave,
        total_biaya: totalBiaya,
        status: "Draft Bill",
      },
    ]);

    if (error) {
      alert("Gagal simpan: " + error.message);
      return;
    }

    window.location.href = "/purchase/bills";
  }

  return (
    <div>
      <h2>Buat Bill</h2>
      <form onSubmit={handleSubmit}>
        {/* Info Vendor */}
        <div className="form-group">
          <label>Vendor</label>
          <select
            className="form-input"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          >
            <option value="">-- pilih --</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Referensi Vendor</label>
          <input
            className="form-input"
            value={referensi}
            onChange={(e) => setReferensi(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Deadline Order</label>
          <input
            className="form-input"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Jenis Pembayaran</label>
          <select
            className="form-input"
            value={jenisPembayaran}
            onChange={(e) => setJenisPembayaran(e.target.value)}
          >
            <option value="">-- pilih --</option>
            <option value="Pembayaran Langsung">Pembayaran Langsung</option>
            <option value="Transfer Bank">Transfer Bank</option>
            <option value="Tempo">Tempo</option>
          </select>
        </div>

        {/* Line Items */}
        <h3 style={{ marginTop: 24 }}>Daftar Bahan</h3>
        <table className="table-slate" style={{ marginBottom: 8 }}>
          <thead>
            <tr>
              <th>Bahan</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>
                  <select
                    value={item.bahan_id}
                    onChange={(e) =>
                      handleItemChange(index, "bahan_id", e.target.value)
                    }
                    required
                  >
                    <option value="">-- pilih bahan --</option>
                    {bahanList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.jumlah}
                    onChange={(e) =>
                      handleItemChange(index, "jumlah", e.target.value)
                    }
                    style={{ width: 80 }}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    value={item.harga_satuan}
                    onChange={(e) =>
                      handleItemChange(index, "harga_satuan", e.target.value)
                    }
                    style={{ width: 120 }}
                    required
                  />
                </td>
                <td>{formatRupiah(item.subtotal)}</td>
                <td>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
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
                Total
              </td>
              <td style={{ fontWeight: "bold" }}>{formatRupiah(totalBiaya)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        <button type="button" className="btn-table-action" onClick={addItem}>
          + Tambah Bahan
        </button>

        <div style={{ marginTop: 24 }}>
          <button className="btn" type="submit">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
