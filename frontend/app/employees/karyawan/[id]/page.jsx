'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export default function KaryawanDetail({ params }){
  const { id } = use(params)
  const [item, setItem] = useState(null)
  const [editing, setEditing] = useState(false)
  const [nama, setNama] = useState('')
  const [posisi, setPosisi] = useState('')
  const [telp, setTelp] = useState('')
  const [email, setEmail] = useState('')

  useEffect(()=>{ fetchItem() },[id])
  async function fetchItem(){
    const { data } = await supabase.from('karyawan').select('*').eq('id', id).single()
    setItem(data || null)
    if (data){ setNama(data.nama); setPosisi(data.posisi); setTelp(data.telp); setEmail(data.email) }
  }

  async function handleUpdate(e){
    e.preventDefault()
    await supabase.from('karyawan').update({ nama, posisi, telp, email }).eq('id', id)
    setEditing(false)
    fetchItem()
  }

  async function handleDelete(){
    if (!confirm('Hapus karyawan?')) return
    await supabase.from('karyawan').delete().eq('id', id)
    window.location.href = '/employees/karyawan'
  }

  if (!item) return <p>Loading...</p>

  return (
    <div className="detail-card">
      <h2>{item.nama}</h2>
      {!editing ? (
        <div>
          <p>Posisi: {item.posisi}</p>
          <p>Telp: {item.telp}</p>
          <p>Email: {item.email}</p>
          <div className="detail-actions">
            <button className="btn-outline" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div><label>Nama</label><br/><input value={nama} onChange={e=>setNama(e.target.value)} /></div>
          <div><label>Posisi</label><br/><input value={posisi} onChange={e=>setPosisi(e.target.value)} /></div>
          <div><label>Telp</label><br/><input value={telp} onChange={e=>setTelp(e.target.value)} /></div>
          <div><label>Email</label><br/><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="detail-actions">
            <button className="btn" type="submit">Simpan</button>
            <button className="btn-outline" type="button" onClick={()=>setEditing(false)}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}
