'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabaseClient'

export default function BahanDetail({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nama, setNama] = useState('')
  const [biaya, setBiaya] = useState('')
  const [harga, setHarga] = useState('')
  const [internalReferensi, setInternalReferensi] = useState('')

  useEffect(() => {
    fetchItem()
  }, [id])

  async function fetchItem() {
    setLoading(true)
    const { data, error } = await supabase.from('bahan').select('*').eq('id', id).single()
    if (error) console.error(error)
    else if (data) {
      setItem(data)
      setNama(data.nama || '')
      setBiaya(data.biaya || '')
      setHarga(data.harga || '')
      setInternalReferensi(data.internal_referensi || '')
    }
    setLoading(false)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    await supabase
      .from('bahan')
      .update({
        nama,
        biaya: parseFloat(biaya || 0),
        harga: parseFloat(harga || 0),
        internal_referensi: internalReferensi || null,
      })
      .eq('id', id)
    setEditing(false)
    fetchItem()
  }

  async function handleDelete() {
    if (!confirm('Hapus bahan ini?')) return
    await supabase.from('bahan').delete().eq('id', id)
    router.push('/manufaktur/bahan')
  }

  if (loading) return <p>Loading...</p>
  if (!item) return <p>Bahan tidak ditemukan</p>

  return (
    <div className="detail-card">
      <h2>Bahan: {item.nama}</h2>
      {!editing ? (
        <div>
          <p>Biaya: {item.biaya}</p>
          <p>Harga: {item.harga}</p>
          <p>Referensi: {item.internal_referensi}</p>
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
            <label>Nama</label>
            <br />
            <input value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div>
            <label>Biaya</label>
            <br />
            <input value={biaya} onChange={(e) => setBiaya(e.target.value)} />
          </div>
          <div>
            <label>Harga</label>
            <br />
            <input value={harga} onChange={(e) => setHarga(e.target.value)} />
          </div>
          <div>
            <label>Internal Referensi</label>
            <br />
            <input value={internalReferensi} onChange={(e) => setInternalReferensi(e.target.value)} />
          </div>
          <div className="detail-actions">
            <button className="btn" type="submit">Simpan</button>
            <button className="btn-outline" type="button" onClick={() => setEditing(false)}>
              Batal
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
