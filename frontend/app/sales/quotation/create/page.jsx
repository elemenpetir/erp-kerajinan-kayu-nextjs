'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'

export default function CreateQuotation(){
  const [customers, setCustomers] = useState([])
  const [produk, setProduk] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(()=>{ fetchRefs() },[])
  async function fetchRefs(){
    const { data: c } = await supabase.from('customer_individual').select('*')
    const { data: p } = await supabase.from('produk').select('*')
    setCustomers(c||[]); setProduk(p||[])
  }

  function addItem(produkId){
    const p = produk.find(pp=>pp.id===produkId)
    if (!p) return
    const it = { produk_id: p.id, nama_produk: p.nama, jumlah: 1, satuan_biaya: p.harga_produksi || 0, total_biaya: p.harga_produksi || 0 }
    setItems(prev=>[...prev, it])
    recalc([...items, it])
  }

  function recalc(list){
    const t = list.reduce((s,i)=> s + (parseFloat(i.total_biaya||0)), 0)
    setTotal(t)
  }

  async function handleSubmit(e){
    e.preventDefault()
    const customer = customers.find(c=>c.id===customerId)
    await supabase.from('quotation').insert([{ customer_id: customerId || null, customer_snapshot: { nama: customer?.nama, email: customer?.email }, items, total_biaya: total }])
    window.location.href = '/sales/quotation'
  }

  return (
    <div>
      <h2>Buat Quotation</h2>
      <form onSubmit={handleSubmit}>
        <div><label>Customer</label><br/>
          <select value={customerId} onChange={e=>setCustomerId(e.target.value)}>
            <option value="">-- pilih --</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.nama}</option>)}
          </select>
        </div>
        <div style={{marginTop:8}}>
          <label>Tambah Produk</label><br/>
          <select onChange={e=>addItem(e.target.value)}>
            <option value="">-- pilih produk --</option>
            {produk.map(p=> <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
        </div>
        <div style={{marginTop:8}}>
          <h4>Items</h4>
          <ul>
            {items.map((it, idx)=> <li key={idx}>{it.nama_produk} — {it.total_biaya}</li>)}
          </ul>
        </div>
        <div><strong>Total: {total}</strong></div>
        <div style={{marginTop:12}}><button className="btn">Simpan</button></div>
      </form>
    </div>
  )
}
