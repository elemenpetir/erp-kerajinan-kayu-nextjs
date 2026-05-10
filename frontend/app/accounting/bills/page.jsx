"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AccountingBills() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    const { data: billData, error } = await supabase
      .from("vendor_bill")
      .select(
        `
        *,
        bills!bill_id(
          referensi_vendor,
          status,
          vendor_id
        )
      `,
      )
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("Error fetch vendor_bill:", error.message);
      setItems([]);
      setLoading(false);
      return;
    }

    const vendorIds = [
      ...new Set(billData.map((b) => b.bills?.vendor_id).filter(Boolean)),
    ];

    let vendorMap = {};
    if (vendorIds.length > 0) {
      const [{ data: vendorsInd }, { data: vendorsCo }] = await Promise.all([
        supabase
          .from("vendor_individual")
          .select("id, nama")
          .in("id", vendorIds),
        supabase.from("vendor_company").select("id, nama").in("id", vendorIds),
      ]);

      [...(vendorsInd || []), ...(vendorsCo || [])].forEach((v) => {
        vendorMap[v.id] = v.nama;
      });
    }

    const merged = billData.map((b) => ({
      ...b,
      vendor_nama: vendorMap[b.bills?.vendor_id] || "-",
    }));

    setItems(merged);
    setLoading(false);
  }

  const total = items.reduce(
    (sum, bill) => sum + parseFloat(bill.jumlah_pembayaran || 0),
    0,
  );

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div>
      <h2>Accounting — Vendor Bills</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>Tidak ada data vendor bill.</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nomor Bill</th>
              <th>Referensi</th>
              <th>Vendor</th>
              <th>Jumlah Pembayaran</th>
              <th>Tanggal Pembayaran</th>
              <th>Status Bill</th>
            </tr>
          </thead>
          <tbody>
            {items.map((bill, index) => (
              <tr key={bill.id}>
                <td>BILL-{String(index + 1).padStart(3, "0")}</td>
                <td>{bill.bills?.referensi_vendor || "-"}</td>
                <td>{bill.vendor_nama}</td>
                <td>{formatRupiah(bill.jumlah_pembayaran)}</td>
                <td>{bill.payment_date}</td>
                <td>{bill.bills?.status || "-"}</td>
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
              <td style={{ fontWeight: "bold" }}>{formatRupiah(total)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
