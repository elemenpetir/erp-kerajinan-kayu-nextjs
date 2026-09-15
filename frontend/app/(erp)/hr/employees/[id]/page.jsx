'use client'
import { useEffect, useState, use } from 'react'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../../../lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import ActionButton from '@/components/ui/ActionButton'

function Def({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{children}</dd>
    </div>
  )
}

export default function KaryawanDetail({ params }){
  const { id } = use(params)
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nama, setNama] = useState('')
  const [posisi, setPosisi] = useState('')
  const [telp, setTelp] = useState('')
  const [email, setEmail] = useState('')

  useEffect(()=>{ fetchItem() },[id])
  async function fetchItem(){
    setLoading(true)
    const { data } = await supabase.from('karyawan').select('*').eq('id', id).single()
    setItem(data || null)
    if (data){ setNama(data.nama || ''); setPosisi(data.posisi || ''); setTelp(data.telp || ''); setEmail(data.email || '') }
    setLoading(false)
  }

  async function handleUpdate(e){
    e.preventDefault()
    const { error } = await supabase.from('karyawan').update({ nama, posisi, telp, email }).eq('id', id)
    if (error) toast.error('Gagal update: ' + error.message)
    else {
      toast.success('Karyawan diperbarui')
      setEditing(false)
      fetchItem()
    }
  }

  async function handleDelete(){
    const { error } = await supabase.from('karyawan').delete().eq('id', id)
    if (error) throw new Error(error.message)
    window.location.href = '/hr/employees'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!item) return <p className="text-sm text-muted-foreground">Karyawan tidak ditemukan</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/hr/employees" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{item.nama}</h1>
          <p className="text-sm text-muted-foreground">Detail karyawan</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!editing ? (
            <dl className="divide-y">
              <Def label="Posisi">{item.posisi || '-'}</Def>
              <Def label="Telp">{item.telp || '-'}</Def>
              <Def label="Email">{item.email || '-'}</Def>
            </dl>
          ) : (
            <form onSubmit={handleUpdate} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={nama} onChange={e=>setNama(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="posisi">Posisi</Label>
                <Input id="posisi" value={posisi} onChange={e=>setPosisi(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telp">Telp</Label>
                  <Input id="telp" value={telp} onChange={e=>setTelp(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={()=>setEditing(false)}>Batal</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      {!editing && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
          <ActionButton
            run={handleDelete}
            confirmTitle="Hapus karyawan?"
            confirmText="Hapus karyawan ini?"
            label="Hapus"
            variant="destructive"
          />
        </div>
      )}
    </div>
  )
}
