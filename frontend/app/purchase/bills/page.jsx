'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function BillsList(){
  const [items, setItems] = useState([])

  useEffect(()=>{ fetchData() },[])
  async function fetchData(){
    const { data } = await supabase.from('bills').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }

  return (
    <div>
      <h2>Purchase - Bills</h2>
      <p><a className="btn" href="/purchase/bills/create">Buat Bill</a></p>
      <table>
        <thead><tr><th>Referensi Vendor</th><th>Deadline</th><th>Total</th></tr></thead>
        <tbody>
          {items.map(b=> (
            <tr key={b.id}><td>{b.referensi_vendor}</td><td>{b.deadline_order}</td><td>{b.total_biaya}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
