"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

const formatRupiah = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount || 0);

export default function BillDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [bill, setBill] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, []);

  async function fetchBill() {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      alert("Bill tidak ditemukan");
      router.push("/purchase/bills");
      return;
    }

    setBill(data);

    // Fetch nama vendor
    if (data.vendor_id) {
      const { data: vInd } = await supabase
        .from("vendor_individual")
        .select("nama")
        .eq("id", data.vendor_id)
        .single();
      if (vInd) setVendor(vInd.nama);
      else {
        const { data: vCo } = await supabase
          .from("vendor_company")
          .select("nama")
          .eq("id", data.vendor_id)
          .single();
        if (vCo) setVendor(vCo.nama);
      }
    }

    setLoading(false);
  }

  async function handleKonfirmasi() {
    await supabase.from("bills").update({ status: "Bill" }).eq("id", id);
    fetchBill();
  }

  async function handleBayar() {
    const { error } = await supabase.from("vendor_bill").insert([
      {
        bill_id: id,
        jumlah_pembayaran: bill.total_biaya,
        payment_date: new Date().toISOString().split("T")[0],
      },
    ]);
    if (error) {
      alert("Gagal bayar: " + error.message);
      return;
    }
    await supabase.from("bills").update({ status: "Paid" }).eq("id", id);
    fetchBill();
  }

  async function handleDelete() {
    if (!confirm("Hapus bill ini?")) return;
    await supabase.from("bills").delete().eq("id", id);
    router.push("/purchase/bills");
  }

  if (loading) return <p>Loading...</p>;
  if (!bill) return null;

  const items = bill.items || [];

  return (
    <div>
      <h2>Detail Bill</h2>
      <div className="detail-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <p>
              <strong>Vendor:</strong> {vendor || "-"}
            </p>
            <p>
              <strong>Referensi:</strong> {bill.referensi_vendor || "-"}
            </p>
            <p>
              <strong>Deadline:</strong> {bill.deadline_order || "-"}
            </p>
            <p>
              <strong>Jenis Pembayaran:</strong> {bill.jenis_pembayaran || "-"}
            </p>
            <p>
              <strong>Status:</strong> {bill.status}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {bill.status === "Draft Bill" && (
              <button className="btn-table-action" onClick={handleKonfirmasi}>
                Konfirmasi
              </button>
            )}
            {bill.status === "Bill" && (
              <button className="btn-table-action" onClick={handleBayar}>
                Bayar
              </button>
            )}
            {bill.status === "Draft Bill" && (
              <button className="btn-danger" onClick={handleDelete}>
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>Daftar Bahan</h3>
      <table className="table-slate">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Bahan</th>
            <th>Jumlah</th>
            <th>Harga Satuan</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={5}>Tidak ada item.</td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.nama_bahan}</td>
                <td>{item.jumlah}</td>
                <td>{formatRupiah(item.harga_satuan)}</td>
                <td>{formatRupiah(item.subtotal)}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold" }}>
              Total
            </td>
            <td style={{ fontWeight: "bold" }}>
              {formatRupiah(bill.total_biaya)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
