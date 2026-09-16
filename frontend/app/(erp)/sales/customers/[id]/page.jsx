"use client";
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { deleteCustomer } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import ActionButton from "@/components/ui/ActionButton";


export default function CustomerDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nama, setNama] = useState("");
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telp, setTelp] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    setLoading(true);
    const { data } = await supabase
      .from("customer_individual")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setItem(data);
      setNama(data.nama || "");
      setNamaPerusahaan(data.nama_perusahaan || "");
      setAlamat(data.alamat || "");
      setTelp(data.telp || "");
      setEmail(data.email || "");
    }
    setLoading(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    const { error } = await supabase
      .from("customer_individual")
      .update({ nama, nama_perusahaan: namaPerusahaan, alamat, telp, email })
      .eq("id", id);
    if (error) toast.error("Gagal update: " + error.message);
    else {
      toast.success("Customer diperbarui");
      setEditing(false);
      fetchItem();
    }
  }

  async function handleDelete() {
    await deleteCustomer(id);
    router.push("/sales/customers");
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
  if (!item) return <p className="text-sm text-muted-foreground">Customer tidak ditemukan</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/sales/customers" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{item.nama}</h1>
          <p className="text-sm text-muted-foreground">Detail customer</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {!editing ? (
            <dl className="divide-y">
              <Def label="Perusahaan">{item.nama_perusahaan || "-"}</Def>
              <Def label="Alamat">{item.alamat || "-"}</Def>
              <Def label="Telp">{item.telp || "-"}</Def>
              <Def label="Email">{item.email || "-"}</Def>
            </dl>
          ) : (
            <form onSubmit={handleUpdate} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama</Label>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="perusahaan">Perusahaan</Label>
                <Input id="perusahaan" value={namaPerusahaan} onChange={(e) => setNamaPerusahaan(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="telp">Telp</Label>
                  <Input id="telp" value={telp} onChange={(e) => setTelp(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={() => { setNama(item.nama || ""); setNamaPerusahaan(item.nama_perusahaan || ""); setAlamat(item.alamat || ""); setTelp(item.telp || ""); setEmail(item.email || ""); setEditing(false); }}>
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
            confirmTitle="Hapus customer?"
            confirmText="Hapus customer ini?"
            label="Hapus"
            variant="destructive"
          />
        </div>
      )}
    </div>
  );
}
