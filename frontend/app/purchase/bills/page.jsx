"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function BillsList() {
  const [items, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from("bills")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  async function handleDelete(id) {
    if (!confirm("Hapus bill ini?")) return;
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) alert("Gagal hapus: " + error.message);
    else fetchData();
  }

  async function handleBayar(b) {
    if (!confirm("Bayar bill ini? Data akan masuk ke Vendor Bill Accounting."))
      return;

    const { error: updateError } = await supabase
      .from("bills")
      .update({ status: "Paid" })
      .eq("id", b.id);

    if (updateError) {
      alert("Gagal update status: " + updateError.message);
      return;
    }

    const { error: insertError } = await supabase.from("vendor_bill").insert([
      {
        bill_id: b.id,
        jumlah_pembayaran: b.total_biaya,
        payment_date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (insertError) {
      alert("Gagal insert vendor bill: " + insertError.message);
      return;
    }

    alert("Bill berhasil dibayar!");
    fetchData();
  }

  async function handleKonfirmasi(id) {
    if (!confirm("Konfirmasi bill ini?")) return;
    const { error } = await supabase
      .from("bills")
      .update({ status: "Bill" })
      .eq("id", id);
    if (error) alert("Gagal konfirmasi: " + error.message);
    else fetchData();
  }

  return (
    <div>
      <h2>Purchase - Bills</h2>
      <p>
        <a className="btn" href="/purchase/bills/create">
          Buat Bill
        </a>
      </p>
      <table className="table-slate">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Referensi Vendor</th>
            <th>Deadline</th>
            <th>Total</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b.id}>
              <td>BILL-{String(b.kode).padStart(4, "0")}</td>
              <td>{b.referensi_vendor}</td>
              <td>{b.deadline_order}</td>
              <td>{b.total_biaya}</td>
              <td>{b.status}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn-table-action"
                    onClick={() => router.push(`/purchase/bills/${b.id}`)}
                  >
                    Lihat
                  </button>
                  {b.status === "Bill" && (
                    <button
                      className="btn-table-action"
                      onClick={() => handleBayar(b)}
                    >
                      Bayar
                    </button>
                  )}
                  {b.status === "Draft Bill" && (
                    <button
                      className="btn-table-action"
                      onClick={() => handleKonfirmasi(b.id)}
                    >
                      Konfirmasi
                    </button>
                  )}
                  {b.status === "Draft Bill" && (
                    <button onClick={() => handleDelete(b.id)}>Hapus</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 24px",
                    color: "#94a3b8",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Belum ada tagihan
                  </p>
                  <p style={{ fontSize: 14 }}>
                    Klik "Buat Bill" untuk mencatat tagihan pertama.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
