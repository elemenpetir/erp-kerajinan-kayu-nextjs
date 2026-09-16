"use client";
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../../../../lib/supabase/client";
import { deleteVendor } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ActionButton from "@/components/ui/ActionButton";


export default function VendorDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    const { data, error } = await supabase
      .from("vendor_individual")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setItem(data || null);
    setLoading(false);
  }

  async function handleDelete() {
    await deleteVendor(id);
    router.push("/purchase/vendors");
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
    );
  }
  if (!item) return <p className="text-sm text-muted-foreground">Vendor tidak ditemukan</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/purchase/vendors" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{item.nama}</h1>
          <p className="text-sm text-muted-foreground">Detail vendor</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <Def label="Perusahaan">{item.nama_perusahaan || "-"}</Def>
            <Def label="Alamat">{item.alamat || "-"}</Def>
            <Def label="Telp">{item.telp || "-"}</Def>
            <Def label="Email">{item.email || "-"}</Def>
          </dl>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <ActionButton
          run={handleDelete}
          confirmTitle="Hapus vendor?"
          confirmText="Yakin ingin menghapus vendor ini?"
          label="Hapus Vendor"
          variant="destructive"
        />
      </div>
    </div>
  );
}
