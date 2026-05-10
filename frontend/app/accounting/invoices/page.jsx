"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AccountingInvoices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_invoice")
      .select("*, sales_order: sales_order_id(customer_snapshot, status, id)")
      .order("payment_date", { ascending: false });

    if (error) {
      console.error(error);
      setItems([]);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }

  const total = items.reduce(
    (sum, inv) => sum + parseFloat(inv.jumlah_pembayaran || 0),
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
      <h2>Accounting — Customer Invoices</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>Tidak ada data customer invoice.</p>
      ) : (
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nomor Invoice</th>
              <th>Customer</th>
              <th>Jumlah Pembayaran</th>
              <th>Tanggal Pembayaran</th>
              <th>Status Sales Order</th>
            </tr>
          </thead>
          <tbody>
            {items.map((invoice, index) => (
              <tr key={invoice.id || index}>
                <td>INV-{String(index + 1).padStart(3, "0")}</td>
                <td>{invoice.sales_order?.customer_snapshot?.nama || "-"}</td>
                <td>{formatRupiah(invoice.jumlah_pembayaran)}</td>
                <td>{invoice.payment_date}</td>
                <td>{invoice.sales_order?.status || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={2}
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
