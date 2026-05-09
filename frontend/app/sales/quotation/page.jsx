'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function QuotationList(){
  const [items, setItems] = useState([])

  useEffect(()=>{ fetchData() },[])
  async function fetchData(){
    const { data } = await supabase.from('quotation').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }

  return (
    <div>
      <h2>Quotation</h2>
      <p><a className="btn" href="/sales/quotation/create">Buat Quotation</a></p>
      <table>
        <thead><tr><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {items.map(q=> (
            <tr key={q.id}><td>{q.customer_snapshot?.nama}</td><td>{q.total_biaya}</td><td>{q.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
