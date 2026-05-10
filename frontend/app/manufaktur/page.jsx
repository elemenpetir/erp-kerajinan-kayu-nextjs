'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function ManufakturList(){
  const [produk, setProduk] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetchProduk()
  },[])

  async function fetchProduk(){
    setLoading(true)
    const { data, error } = await supabase.from('produk').select('*').order('created_at', { ascending: false })
    if (error) console.error(error)
    else setProduk(data || [])
    setLoading(false)
  }

  return (
    <div>
      <h2>Manufaktur — Produk</h2>
      <div className="action-buttons" style={{ marginBottom: 12 }}>
        <a className="btn" href="/manufaktur/bahan">
          Bahan
        </a>
        <a className="btn" href="/manufaktur/kategori">
          Kategori
        </a>
        <a className="btn" href="/manufaktur/bom">
          BOM
        </a>
      </div>
      <p><a className="btn" href="/manufaktur/create">Buat Produk</a></p>
      {loading ? <p>Loading...</p> : (
        <table className="table-slate">
          <thead><tr><th>Nama</th><th>Harga Produksi</th><th>Biaya Produksi</th><th>Aksi</th></tr></thead>
          <tbody>
            {produk.map(p=> (
              <tr key={p.id}>
                <td>{p.nama}</td>
                <td>{p.harga_produksi}</td>
                <td>{p.biaya_produksi}</td>
                <td>
                  <div className="action-buttons">
                    <a href={`/manufaktur/${p.id}`}>Lihat / Edit</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
