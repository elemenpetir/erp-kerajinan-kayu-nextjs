'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export default function VendorDetail({ params }){
  const { id } = params
  const [item, setItem] = useState(null)

  useEffect(()=>{ fetchItem() },[id])
  async function fetchItem(){
    const { data } = await supabase.from('vendor_individual').select('*').eq('id', id).single()
    setItem(data || null)
  }

  if (!item) return <p>Loading...</p>

  return (
    <div>
      <h2>{item.nama}</h2>
      <p>Perusahaan: {item.nama_perusahaan}</p>
      <p>Alamat: {item.alamat}</p>
      <p>Telp: {item.telp}</p>
      <p>Email: {item.email}</p>
    </div>
  )
}
