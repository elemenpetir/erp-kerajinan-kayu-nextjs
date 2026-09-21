'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../../../lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/NativeSelect'

export default function CreateKaryawan(){
  const [nama, setNama] = useState('')
  const [posisi, setPosisi] = useState('')
  const [telp, setTelp] = useState('')
  const [email, setEmail] = useState('')
  const [departemen, setDepartemen] = useState('')
  const [deps, setDeps] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(()=>{ fetchDeps() },[])
  async function fetchDeps(){
    const { data } = await supabase.from('departemen').select('id,nama_departemen').order('nama_departemen')
    setDeps(data||[])
  }

  async function handleSubmit(e){
    e.preventDefault()
    const cleanNama = nama.trim();
    if (!cleanNama) {
      toast.error('Nama wajib diisi.');
      return;
    }
    setSaving(true)
    const { error } = await supabase.from('karyawan').insert([{ departemen_id: departemen || null, nama: cleanNama, posisi: posisi.trim(), telp: telp.trim(), email: email.trim() }])
    setSaving(false)
    if (error) toast.error('Gagal simpan: ' + error.message)
    else window.location.href = '/hr/employees'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/hr/employees" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Tambah Karyawan</h1>
          <p className="text-sm text-muted-foreground">Daftarkan personel baru beserta unitnya.</p>
        </div>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Data karyawan</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nama">Nama</Label>
              <Input id="nama" value={nama} onChange={e=>setNama(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="posisi">Posisi</Label>
                <Input id="posisi" value={posisi} onChange={e=>setPosisi(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="departemen">Departemen</Label>
                <NativeSelect id="departemen" value={departemen} onChange={e=>setDepartemen(e.target.value)}>
                  <option value="">-- pilih --</option>
                  {deps.map(d=> <option key={d.id} value={d.id}>{d.nama_departemen}</option>)}
                </NativeSelect>
              </div>
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
