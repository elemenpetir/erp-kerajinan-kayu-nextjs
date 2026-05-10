'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function ProdukDetail({ params }){
  const { id } = use(params)
  const [produk, setProduk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [biaya, setBiaya] = useState('')

  useEffect(()=>{ fetchProduk() }, [id])

  async function fetchProduk(){
    setLoading(true)
    const { data, error } = await supabase.from('produk').select('*').eq('id', id).single()
    if (error) console.error(error)
    else {
      setProduk(data)
      setNama(data.nama||'')
      setHarga(data.harga_produksi||'')
      setBiaya(data.biaya_produksi||'')
    }
    setLoading(false)
  }

  async function handleUpdate(e){
    e.preventDefault()
    await supabase.from('produk').update({ nama, harga_produksi: parseFloat(harga||0), biaya_produksi: parseFloat(biaya||0) }).eq('id', id)
    setEditing(false)
    fetchProduk()
  }

  async function handleDelete(){
    if (!confirm('Hapus produk ini?')) return
    await supabase.from('produk').delete().eq('id', id)
    // redirect back
    window.location.href = '/manufaktur'
  }

  if (loading) return <p>Loading...</p>
  if (!produk) return <p>Produk tidak ditemukan</p>

  return (
    <div className="detail-card">
      <h2>Produk: {produk.nama}</h2>
      {!editing ? (
        <div>
          <p>Harga Produksi: {produk.harga_produksi}</p>
          <p>Biaya Produksi: {produk.biaya_produksi}</p>
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
          <div>
            <label>Nama</label><br/>
            <input value={nama} onChange={e=>setNama(e.target.value)} />
          </div>
          <div>
            <label>Harga Produksi</label><br/>
            <input value={harga} onChange={e=>setHarga(e.target.value)} />
          </div>
          <div>
            <label>Biaya Produksi</label><br/>
            <input value={biaya} onChange={e=>setBiaya(e.target.value)} />
          </div>
          <div className="detail-actions">
            <button className="btn" type="submit">Simpan</button>
            <button className="btn-outline" type="button" onClick={()=>setEditing(false)}>Batal</button>
          </div>
        </form>
      )}
    </div>
  )
}
