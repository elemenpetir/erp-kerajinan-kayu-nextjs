'use client'
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from 'react'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../../../../lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import ActionButton from '@/components/ui/ActionButton'


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
    const { error } = await supabase.from('bom').delete().eq('id', id)
    if (error) throw new Error(error.message)
    window.location.href = '/manufacturing/boms'
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
  if (!bom) return <p className="text-sm text-muted-foreground">BOM tidak ditemukan</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/boms" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">BOM untuk: {bom.produk?.nama || 'Produk tidak diketahui'}</h1>
          <p className="text-sm text-muted-foreground">Komposisi dan biaya</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <Def label="Jumlah Produk">{bom.jumlah_produk}</Def>
            <Def label="Total Biaya Produk">{Number(bom.total_biaya_produk || 0).toLocaleString('id-ID')}</Def>
            <Def label="Total Biaya Bahan">{Number(bom.total_biaya_bahan || 0).toLocaleString('id-ID')}</Def>
            <Def label="Referensi">{bom.internal_referensi || '-'}</Def>
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Komponen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Bahan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(bom.components || []).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.nama_bahan}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.jumlah}</TableCell>
                  <TableCell className="text-right tabular-nums">{Number(item.harga || 0).toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number((item.harga || 0) * (item.jumlah || 0)).toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <ActionButton
          run={handleDelete}
          confirmTitle="Hapus BOM?"
          confirmText="Hapus BOM ini?"
          label="Hapus"
          variant="destructive"
        />
      </div>
    </div>
  )
}
