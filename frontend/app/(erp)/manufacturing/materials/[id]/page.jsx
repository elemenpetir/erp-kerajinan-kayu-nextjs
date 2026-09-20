'use client'
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../../../lib/supabase/client'
import { deleteMaterial, updateMaterial } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import ActionButton from '@/components/ui/ActionButton'
import { uploadImage } from '@/lib/storage/upload'


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
    try {
      await updateMaterial(id, { nama, biaya, harga, internal_referensi: internalReferensi })
      toast.success('Bahan diperbarui')
      setEditing(false)
      fetchItem()
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleDelete() {
    const { error } = await supabase.from('bahan').delete().eq('id', id)
    if (error) throw new Error(error.message)
    router.push('/manufacturing/materials')
  }

  async function handleFoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const url = await uploadImage('bahan-images', f)
      const { error } = await supabase.from('bahan').update({ gambar_url: url }).eq('id', id)
      if (error) throw new Error(error.message)
      toast.success('Foto diperbarui')
      fetchItem()
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4 pt-0">
          {item.gambar_url ? (
            <img src={item.gambar_url} alt={item.nama} className="h-24 w-24 rounded-md object-cover" />
          ) : (
            <span className="text-sm text-muted-foreground">Belum ada foto</span>
          )}
          <Input type="file" accept="image/*" onChange={handleFoto} className="max-w-xs" aria-label="Ganti foto" />
        </CardContent>
      </Card>
      <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!item) return <p className="text-sm text-muted-foreground">Bahan tidak ditemukan</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/materials" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Bahan: {item.nama}</h1>
          <p className="text-sm text-muted-foreground">Detail bahan baku</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!editing ? (
            <dl className="divide-y">
              <Def label="Biaya">{Number(item.biaya || 0).toLocaleString('id-ID')}</Def>
              <Def label="Harga">{Number(item.harga || 0).toLocaleString('id-ID')}</Def>
              <Def label="Referensi">{item.internal_referensi || '-'}</Def>
            </dl>
          ) : (
            <form onSubmit={handleUpdate} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="biaya">Biaya</Label>
                  <Input id="biaya" type="number" min="0" value={biaya} onChange={(e) => setBiaya(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="harga">Harga</Label>
                  <Input id="harga" type="number" min="0" value={harga} onChange={(e) => setHarga(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ref">Internal Referensi</Label>
                <Input id="ref" value={internalReferensi} onChange={(e) => setInternalReferensi(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={() => { setNama(item.nama || ""); setBiaya(item.biaya || ""); setHarga(item.harga || ""); setInternalReferensi(item.internal_referensi || ""); setEditing(false); }}>
                  Batal
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      {!editing && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <ActionButton
            run={handleDelete}
            confirmTitle="Hapus bahan?"
            confirmText="Hapus bahan ini?"
            label="Hapus"
            variant="destructive"
          />
        </div>
      )}
    </div>
  )
}
