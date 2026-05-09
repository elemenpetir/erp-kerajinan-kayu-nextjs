'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export default function CreateBill(){
  const [vendorId, setVendorId] = useState('')
  const [vendors, setVendors] = useState([])
  const [referensi, setReferensi] = useState('')
  const [deadline, setDeadline] = useState('')
  const [total, setTotal] = useState('')

  useEffect(()=>{ fetchVendors() },[])
  async function fetchVendors(){
    const { data } = await supabase.from('vendor_individual').select('*')
    setVendors(data || [])
  }

  async function handleSubmit(e){
    e.preventDefault()
    await supabase.from('bills').insert([{ vendor_id: vendorId||null, referensi_vendor: referensi, deadline_order: deadline||null, total_biaya: parseFloat(total||0) }])
    window.location.href = '/purchase/bills'
  }

  return (
    <div>
      <h2>Buat Bill</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vendor</label><br/>
          <select value={vendorId} onChange={e=>setVendorId(e.target.value)}>
            <option value="">-- pilih --</option>
            {vendors.map(v=> <option key={v.id} value={v.id}>{v.nama}</option>)}
          </select>
        </div>
        <div><label>Referensi Vendor</label><br/><input value={referensi} onChange={e=>setReferensi(e.target.value)}/></div>
        <div><label>Deadline</label><br/><input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}/></div>
        <div><label>Total Biaya</label><br/><input value={total} onChange={e=>setTotal(e.target.value)}/></div>
        <div style={{marginTop:12}}><button className="btn">Simpan</button></div>
      </form>
    </div>
  )
}
