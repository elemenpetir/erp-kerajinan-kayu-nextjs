'use client'
import { useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export default function CreateVendor(){
  const [nama, setNama] = useState('')
  const [perusahaan, setPerusahaan] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telp, setTelp] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    await supabase.from('vendor_individual').insert([{ nama, nama_perusahaan: perusahaan, alamat, telp, email }])
    window.location.href = '/purchase/vendors'
  }

  return (
    <div>
      <h2>Tambah Vendor</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Nama</label><br/><input value={nama} onChange={e=>setNama(e.target.value)} required/></div>
        <div><label>Perusahaan</label><br/><input value={perusahaan} onChange={e=>setPerusahaan(e.target.value)}/></div>
        <div><label>Alamat</label><br/><input value={alamat} onChange={e=>setAlamat(e.target.value)}/></div>
        <div><label>Telp</label><br/><input value={telp} onChange={e=>setTelp(e.target.value)}/></div>
        <div><label>Email</label><br/><input value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div style={{marginTop:12}}><button className="btn">Simpan</button></div>
      </form>
    </div>
  )
}
