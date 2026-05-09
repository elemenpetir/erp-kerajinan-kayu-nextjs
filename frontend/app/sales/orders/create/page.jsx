"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function CreateOrder() {
  const [quotations, setQuotations] = useState([]);
  const [quotationId, setQuotationId] = useState("");

  useEffect(() => {
    fetchQuotations();
  }, []);
  async function fetchQuotations() {
    const { data } = await supabase
      .from("quotation")
      .select("*")
      .eq("status", "Quotation");
    setQuotations(data || []);
  }

  async function handleConvert(e) {
    e.preventDefault();
    const q = quotations.find((x) => x.id === quotationId);
    if (!q) return;
    await supabase
      .from("sales_order")
      .insert([
        {
          quotation_id: q.id,
          customer_id: q.customer_id,
          customer_snapshot: q.customer_snapshot,
          items: q.items,
          total_biaya: q.total_biaya,
          status: "To Invoice",
        },
      ]);
    // update quotation status
    await supabase
      .from("quotation")
      .update({ status: "Sales Order" })
      .eq("id", q.id);
    window.location.href = "/sales/orders";
  }

  return (
    <div>
      <h2>Buat Sales Order dari Quotation</h2>
      <form onSubmit={handleConvert}>
        <div>
          <label>Pilih Quotation</label>
          <br />
          <select
            value={quotationId}
            onChange={(e) => setQuotationId(e.target.value)}
          >
            <option value="">-- pilih --</option>
            {quotations.map((q) => (
              <option key={q.id} value={q.id}>
                {q.customer_snapshot?.nama} — {q.total_biaya}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn">Convert</button>
        </div>
      </form>
    </div>
  );
}
