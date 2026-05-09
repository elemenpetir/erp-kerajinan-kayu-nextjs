"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function OrdersList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    const { data } = await supabase
      .from("sales_order")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  return (
    <div>
      <h2>Sales Orders</h2>
      <p>
        <a className="btn" href="/sales/orders/create">
          Buat Sales Order (from Quotation)
        </a>
      </p>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>{o.customer_snapshot?.nama}</td>
              <td>{o.total_biaya}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
