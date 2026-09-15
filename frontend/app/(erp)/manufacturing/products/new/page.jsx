"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateProduk() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga_produksi: parseFloat(harga || 0),
        biaya_produksi: 0, // akan dihitung otomatis dari BOM
      },
    ]);
    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/manufacturing/products");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/products" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Buat Produk</h1>
          <p className="text-sm text-muted-foreground">Tambahkan produk baru ke katalog.</p>
        </div>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Data produk</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nama">Nama Produk</Label>
              <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="harga">Harga Jual</Label>
              <Input
                id="harga"
                type="number"
                min="0"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                placeholder="Rp 0"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
              {message && <span className="text-sm text-destructive">{message}</span>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
