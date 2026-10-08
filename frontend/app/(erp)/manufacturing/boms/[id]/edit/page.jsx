'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../../../../lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import BomForm from '../../_components/BomForm';

export default function EditBom({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBom();
  }, [id]);

  async function fetchBom() {
    setLoading(true);
    const { data, error } = await supabase
      .from('bom')
      .select('id,produk_id,jumlah_produk,internal_referensi,components,produk:produk_id(nama)')
      .eq('id', id)
      .single();
    if (error) console.error(error);
    else setBom(data);
    setLoading(false);
  }

  async function handleUpdate(values) {
    const { error } = await supabase
      .from('bom')
      .update({
        components: values.components,
        jumlah_produk: values.jumlah_produk,
        internal_referensi: values.internal_referensi,
        total_biaya_produk: values.total_biaya_produk,
        total_biaya_bahan: values.total_biaya_bahan,
      })
      .eq('id', id);
    if (error) throw error;
    toast.success('BOM diperbarui');
    router.push(`/manufacturing/boms/${id}`);
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
    );
  }

  if (!bom) return <p className="text-sm text-muted-foreground">BOM tidak ditemukan.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/manufacturing/boms/${id}`} aria-label="Kembali">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Ubah BOM</h1>
          <p className="text-sm text-muted-foreground">Ubah komposisi bahan. Berlaku untuk order baru.</p>
        </div>
      </div>
      <BomForm
        initial={{
          produk_id: bom.produk_id,
          produk_nama: bom.produk?.nama,
          jumlah_produk: bom.jumlah_produk,
          internal_referensi: bom.internal_referensi,
          components: bom.components,
        }}
        submitLabel="Simpan Perubahan"
        note="Perubahan hanya berlaku untuk order produksi baru. Order lama memakai snapshot komponennya."
        onSubmit={handleUpdate}
      />
    </div>
  );
}
