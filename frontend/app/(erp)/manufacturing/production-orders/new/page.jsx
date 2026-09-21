"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

const emptyItem = {
  bahan_id: "",
  nama_bahan: "",
  jumlah: 1,
  harga_satuan: 0,
  subtotal: 0,
};

export default function CreateOrderProduksi() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [produkId, setProdukId] = useState("");
  const [bomId, setBomId] = useState("");
  const [jumlahProduk, setJumlahProduk] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  async function fetchOptions() {
    const [{ data: produkData }, { data: bomData }] = await Promise.all([
      supabase.from("produk").select("id,nama"),
      supabase
        .from("bom")
        .select(
          "id,produk_id,jumlah_produk,internal_referensi,total_biaya_produk,total_biaya_bahan,components, produk:produk_id(nama)",
        ),
    ]);
    setProducts(produkData || []);
    setBoms(bomData || []);
  }

  // BOM difilter per produk agar komponen selalu cocok dengan produk.
  const filteredBoms = produkId ? boms.filter((bom) => bom.produk_id === produkId) : boms;

  function handleProdukChange(value) {
    setProdukId(value);
    setBomId((prev) => (boms.some((bom) => bom.id === prev && bom.produk_id === value) ? prev : ""));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const selectedBom = boms.find((bom) => bom.id === bomId);
    if (!produkId || !bomId || !selectedBom) {
      setMessage("Pilih produk dan BOM terlebih dahulu.");
      setLoading(false);
      return;
    }
    if (selectedBom.produk_id !== produkId) {
      setMessage("BOM tersebut bukan milik produk yang dipilih.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("order_produksi").insert([
      {
        produk_id: produkId,
        bom_id: bomId,
        jumlah_produk: parseInt(jumlahProduk || "1", 10),
        components: selectedBom.components || [],
        status: "Draft",
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      toast.success("Order produksi dibuat");
      router.push("/manufacturing/production-orders");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/production-orders" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Buat Order Produksi</h1>
          <p className="text-sm text-muted-foreground">Rencanakan produksi dari BOM yang sudah ada.</p>
        </div>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Data order</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="produk">Produk</Label>
              <NativeSelect
                id="produk"
                
                value={produkId}
                onChange={(e) => handleProdukChange(e.target.value)}
                required
              >
                <option value="">-- pilih produk --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nama}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bom">BOM</Label>
              <NativeSelect
                id="bom"
                
                value={bomId}
                onChange={(e) => setBomId(e.target.value)}
                required
              >
                <option value="">-- pilih BOM --</option>
                {filteredBoms.map((bom) => (
                  <option key={bom.id} value={bom.id}>
                    {bom.produk?.nama || bom.id} - {bom.internal_referensi || "BOM"}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jumlah">Jumlah Produksi</Label>
              <Input
                id="jumlah"
                type="number"
                min="1"
                value={jumlahProduk}
                onChange={(e) => setJumlahProduk(e.target.value)}
                required
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
