'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function KaryawanList(){
  const [items, setItems] = useState([])

  useEffect(()=>{ fetchData() },[])

  async function fetchData(){
    const { data } = await supabase.from('karyawan').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }

  return (
    <div>
      <h2>Karyawan</h2>
      <p><a className="btn" href="/employees/karyawan/create">Tambah Karyawan</a></p>
      <table>
        <thead><tr><th>Nama</th><th>Posisi</th><th>Telp</th><th>Email</th><th>Aksi</th></tr></thead>
        <tbody>
          {items.map(k=> (
            <tr key={k.id}>
              <td>{k.nama}</td>
              <td>{k.posisi}</td>
              <td>{k.telp}</td>
              <td>{k.email}</td>
              <td><a href={`/employees/karyawan/${k.id}`}>Lihat / Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
