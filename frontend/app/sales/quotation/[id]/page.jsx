"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

export default function QuotationDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotation")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setQ(data);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Hapus quotation ini?")) return;
    const { error } = await supabase.from("quotation").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else router.push("/sales/quotation");
  }

  async function handleConfirm() {
    if (!confirm("Konfirmasi quotation ini menjadi Sales Order?")) return;

    const { data: existing } = await supabase
      .from("sales_order")
      .select("id")
      .eq("quotation_id", id)
      .single();
    if (existing)
      return alert("Sales Order untuk quotation ini sudah pernah dibuat!");

    const { error: errQ } = await supabase
      .from("quotation")
      .update({ status: "Sales Order" })
      .eq("id", id);
    if (errQ) return alert("Gagal update quotation: " + errQ.message);

    const { error: errSO } = await supabase.from("sales_order").insert({
      quotation_id: id,
      customer_id: q.customer_id,
      customer_snapshot: q.customer_snapshot,
      expiration: q.expiration,
      payment_terms: q.payment_terms,
      items: q.items,
      total_biaya: q.total_biaya,
      status: "To Invoice",
      status_delivery: "Sedang Dikirim",
    });
    if (errSO) return alert("Gagal buat Sales Order: " + errSO.message);

    alert("Berhasil! Sales Order telah dibuat.");
    fetchData();
  }

  if (loading) return <p>Loading...</p>;
  if (!q) return <p>Quotation tidak ditemukan</p>;

  const isDraft = q.status !== "Sales Order";

  return (
    <div className="detail-card">
      <h2>Detail Quotation</h2>
      <div style={{ marginBottom: 16 }}>
        <p>
          <strong>Customer:</strong> {q.customer_snapshot?.nama || "-"}
        </p>
        <p>
          <strong>Email:</strong> {q.customer_snapshot?.email || "-"}
        </p>
        <p>
          <strong>Payment Terms:</strong> {q.payment_terms || "-"}
        </p>
        <p>
          <strong>Expiration:</strong> {q.expiration || "-"}
        </p>
        <p>
          <strong>Status:</strong> {q.status}
        </p>
        <p>
          <strong>Tanggal:</strong>{" "}
          {q.created_at
            ? new Date(q.created_at).toLocaleDateString("id-ID")
            : "-"}
        </p>
      </div>
      <h3>Daftar Produk</h3>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Produk</th>
            <th>Jumlah</th>
            <th>Harga Satuan</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(q.items || []).length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                Tidak ada item
              </td>
            </tr>
          )}
          {(q.items || []).map((it, idx) => (
            <tr key={idx}>
              <td>{it.nama_produk}</td>
              <td>{it.jumlah}</td>
              <td>Rp {Number(it.satuan_biaya || 0).toLocaleString("id-ID")}</td>
              <td>Rp {Number(it.total_biaya || 0).toLocaleString("id-ID")}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={3} style={{ textAlign: "right", fontWeight: "bold" }}>
              Total
            </td>
            <td>
              <strong>
                Rp {Number(q.total_biaya || 0).toLocaleString("id-ID")}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a
            className="btn-outline"
            href="/sales/quotation"
            style={{ marginBottom: 0 }}
          >
            ← Kembali
          </a>
          {isDraft && (
            <button
              className="btn-danger"
              onClick={handleDelete}
              style={{ marginBottom: 0 }}
            >
              Hapus
            </button>
          )}
        </div>
        <div>
          {isDraft && (
            <button
              className="btn"
              onClick={handleConfirm}
              style={{ marginBottom: 0 }}
            >
              Konfirmasi → Sales Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
