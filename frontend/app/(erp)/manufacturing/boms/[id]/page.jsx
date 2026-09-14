'use client'
import { useEffect, useState, use } from 'react'
import { supabase } from '../../../../../lib/supabase/client'

export default function BomDetail({ params }) {
  const { id } = use(params)
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBom()
  }, [id])

  async function fetchBom() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bom')
      .select('*, produk:produk_id(nama)')
      .eq('id', id)
      .single()
    if (error) console.error(error)
    else setBom(data)
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Hapus BOM ini?')) return
    await supabase.from('bom').delete().eq('id', id)
    window.location.href = '/manufacturing/boms'
  }

  if (loading) return <p>Loading...</p>
  if (!bom) return <p>BOM tidak ditemukan</p>

  return (
    <div className="detail-card">
      <h2>BOM untuk: {bom.produk?.nama || 'Produk tidak diketahui'}</h2>
      <p>Jumlah Produk: {bom.jumlah_produk}</p>
      <p>Total Biaya Produk: {bom.total_biaya_produk}</p>
      <p>Total Biaya Bahan: {bom.total_biaya_bahan}</p>
      <p>Referensi: {bom.internal_referensi}</p>
      <div className="detail-actions">
        <button className="btn-danger" onClick={handleDelete}>
          Hapus
        </button>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Komponen</h3>
        <table className="table-slate">
          <thead>
            <tr>
              <th>Nama Bahan</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(bom.components || []).map((item, index) => (
              <tr key={index}>
                <td>{item.nama_bahan}</td>
                <td>{item.jumlah}</td>
                <td>{item.harga}</td>
                <td>{item.harga * (item.jumlah || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
