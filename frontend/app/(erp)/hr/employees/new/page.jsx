'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../../../lib/supabase/client'

export default function CreateKaryawan(){
  const [nama, setNama] = useState('')
  const [posisi, setPosisi] = useState('')
  const [telp, setTelp] = useState('')
  const [email, setEmail] = useState('')
  const [departemen, setDepartemen] = useState('')
  const [deps, setDeps] = useState([])

  useEffect(()=>{ fetchDeps() },[])
  async function fetchDeps(){
    const { data } = await supabase.from('departemen').select('*')
    setDeps(data||[])
  }

  async function handleSubmit(e){
    e.preventDefault()
    await supabase.from('karyawan').insert([{ departemen_id: departemen || null, nama, posisi, telp, email }])
    window.location.href = '/hr/employees'
  }

  return (
    <div>
      <h2>Tambah Karyawan</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Nama</label><br/><input value={nama} onChange={e=>setNama(e.target.value)} required/></div>
        <div><label>Posisi</label><br/><input value={posisi} onChange={e=>setPosisi(e.target.value)}/></div>
        <div><label>Telp</label><br/><input value={telp} onChange={e=>setTelp(e.target.value)}/></div>
        <div><label>Email</label><br/><input value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div>
          <label>Departemen</label><br/>
          <select value={departemen} onChange={e=>setDepartemen(e.target.value)}>
            <option value="">-- pilih --</option>
            {deps.map(d=> <option key={d.id} value={d.id}>{d.nama_departemen}</option>)}
          </select>
        </div>
        <div style={{marginTop:12}}><button className="btn">Simpan</button></div>
      </form>
    </div>
  )
}
