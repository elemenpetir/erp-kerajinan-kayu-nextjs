'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../../../lib/supabase/client'
import { deleteMaterial } from '../actions'
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
    const { error } = await supabase
      .from('bahan')
      .update({
        nama,
        biaya: parseFloat(biaya || 0),
        harga: parseFloat(harga || 0),
        internal_referensi: internalReferensi || null,
      })
      .eq('id', id)
    if (error) {
      toast.error('Gagal update: ' + error.message)
      return
    }
    setEditing(false)
    fetchItem()
  }

  async function handleDelete() {
    const { error } = await supabase.from('bahan').delete().eq('id', id)
    if (error) throw new Error(error.message)
    router.push('/manufacturing/materials')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
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
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Batal
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      {!editing && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
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
