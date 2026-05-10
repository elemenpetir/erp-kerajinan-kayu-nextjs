'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function VendorsList(){
  const [items, setItems] = useState([])

  useEffect(()=>{ fetchData() },[])
  async function fetchData(){
    const { data } = await supabase.from('vendor_individual').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }

  return (
    <div>
      <h2>Vendors</h2>
      <p><a className="btn" href="/purchase/vendors/create">Tambah Vendor</a></p>
      <table className="table-slate">
        <thead><tr><th>Nama</th><th>Perusahaan</th><th>Telp</th><th>Email</th><th>Aksi</th></tr></thead>
        <tbody>
          {items.map(v=> (
            <tr key={v.id}>
              <td>{v.nama}</td>
              <td>{v.nama_perusahaan}</td>
              <td>{v.telp}</td>
              <td>{v.email}</td>
              <td>
                <div className="action-buttons">
                  <a href={`/purchase/vendors/${v.id}`}>Lihat</a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
