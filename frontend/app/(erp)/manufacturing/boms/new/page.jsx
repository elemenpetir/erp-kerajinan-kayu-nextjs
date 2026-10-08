"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import BomForm from "../_components/BomForm";

export default function CreateBom() {
  const router = useRouter();

  async function handleCreate(values) {
    const { error } = await supabase.from("bom").insert([
      {
        produk_id: values.produk_id,
        components: values.components,
        jumlah_produk: values.jumlah_produk,
        internal_referensi: values.internal_referensi,
        total_biaya_produk: values.total_biaya_produk,
        total_biaya_bahan: values.total_biaya_bahan,
      },
    ]);
    if (error) throw error;
    toast.success("BOM dibuat");
    router.push("/manufacturing/boms");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/manufacturing/boms" aria-label="Kembali">
            <ArrowLeft />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Buat BOM</h1>
          <p className="text-sm text-muted-foreground">Susun komposisi bahan untuk satu produk.</p>
        </div>
      </div>
      <BomForm submitLabel="Simpan" onSubmit={handleCreate} />
    </div>
  );
}
