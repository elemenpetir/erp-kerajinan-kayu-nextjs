'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function CreateProduk(){
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [biaya, setBiaya] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.from('produk').insert([{ nama, harga_produksi: parseFloat(harga||0), biaya_produksi: parseFloat(biaya||0), internal_referensi: null }])
    if (error) setMessage('Error: '+error.message)
    else setMessage('Produk dibuat')
    setLoading(false)
  }

  return (
    <div>
      <h2>Buat Produk</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nama</label><br/>
          <input value={nama} onChange={e=>setNama(e.target.value)} required />
        </div>
        <div>
          <label>Harga Produksi</label><br/>
          <input value={harga} onChange={e=>setHarga(e.target.value)} />
        </div>
        <div>
          <label>Biaya Produksi</label><br/>
          <input value={biaya} onChange={e=>setBiaya(e.target.value)} />
        </div>
        <div style={{marginTop:12}}>
          <button className="btn" type="submit" disabled={loading}>{loading? 'Menyimpan...':'Simpan'}</button>
          <span style={{marginLeft:12}}>{message}</span>
        </div>
      </form>
    </div>
  )
}
