'use client'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../../../lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CreateVendor(){
  const [nama, setNama] = useState('')
  const [perusahaan, setPerusahaan] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telp, setTelp] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    const cleanNama = nama.trim();
    if (!cleanNama) {
      toast.error('Nama wajib diisi.');
      return;
    }
    setSaving(true)
    const { error } = await supabase.from('vendor_individual').insert([{ nama: cleanNama, nama_perusahaan: perusahaan.trim(), alamat: alamat.trim(), telp: telp.trim(), email: email.trim() }])
    setSaving(false)
    if (error) toast.error('Gagal simpan: ' + error.message)
    else window.location.href = '/purchase/vendors'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/purchase/vendors" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Tambah Vendor</h1>
          <p className="text-sm text-muted-foreground">Daftarkan pemasok bahan baku baru.</p>
        </div>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Data vendor</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nama">Nama</Label>
              <Input id="nama" value={nama} onChange={e=>setNama(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="perusahaan">Perusahaan</Label>
              <Input id="perusahaan" value={perusahaan} onChange={e=>setPerusahaan(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input id="alamat" value={alamat} onChange={e=>setAlamat(e.target.value)} />
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
            <div>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
