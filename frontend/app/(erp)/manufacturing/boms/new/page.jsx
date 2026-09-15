"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { formatRupiah } from "../../../../../lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function CreateBom() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [produkId, setProdukId] = useState("");
  const [jumlahProduk, setJumlahProduk] = useState("1");
  const [internalReferensi, setInternalReferensi] = useState("");
  const [components, setComponents] = useState([{ bahanId: "", jumlah: "1" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOptions();
  }, []);

  async function fetchOptions() {
    const [{ data: produkData }, { data: bahanData }] = await Promise.all([
      supabase.from("produk").select("id,nama,harga_produksi"),
      supabase.from("bahan").select("id,nama,harga,biaya"),
    ]);
    setProducts(produkData || []);
    setBahanList(bahanData || []);
  }

  function updateComponent(index, field, value) {
    const next = [...components];
    next[index] = { ...next[index], [field]: value };
    setComponents(next);
  }

  function addComponent() {
    setComponents([...components, { bahanId: "", jumlah: "1" }]);
  }

  function removeComponent(index) {
    if (components.length === 1) return;
    setComponents(components.filter((_, idx) => idx !== index));
  }

  const componentTotals = components.map((component) => {
    const bahan = bahanList.find((item) => item.id === component.bahanId);
    const qty = parseFloat(component.jumlah || 0);
    const biaya = parseFloat(bahan?.biaya || 0);
    return {
      ...component,
      nama: bahan?.nama || "",
      biaya,
      subtotal: qty * biaya,
    };
  });

  const totalBiayaBahan = componentTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedProduct = products.find((p) => p.id === produkId);
  const totalBiayaProduk = selectedProduct
    ? parseFloat(selectedProduct.harga_produksi || 0) * parseInt(jumlahProduk || "1", 10)
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const validComponents = componentTotals
      .filter((item) => item.bahanId && parseFloat(item.jumlah) > 0)
      .map((item) => ({
        bahan_id: item.bahanId,
        nama_bahan: item.nama,
        jumlah: parseFloat(item.jumlah || 0),
        harga: item.biaya,
        satuan: "pcs",
      }));

    if (!produkId || validComponents.length === 0) {
      setMessage("Pilih produk dan setidaknya satu bahan.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("bom").insert([
      {
        produk_id: produkId,
        components: validComponents,
        jumlah_produk: parseInt(jumlahProduk || "1", 10),
        internal_referensi: internalReferensi || null,
        total_biaya_produk: totalBiayaProduk,
        total_biaya_bahan: totalBiayaBahan,
      },
    ]);

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
    } else {
      toast.success("BOM dibuat");
      router.push("/manufacturing/boms");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/boms" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Buat BOM</h1>
          <p className="text-sm text-muted-foreground">Susun komposisi bahan untuk satu produk.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Info produk</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="produk">Produk</Label>
              <select
                id="produk"
                className={selectClass}
                value={produkId}
                onChange={(e) => setProdukId(e.target.value)}
                required
              >
                <option value="">-- pilih produk --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jumlah">Jumlah Produk</Label>
              <Input
                id="jumlah"
                type="number"
                min="1"
                value={jumlahProduk}
                onChange={(e) => setJumlahProduk(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ref">Internal Referensi</Label>
              <Input
                id="ref"
                value={internalReferensi}
                onChange={(e) => setInternalReferensi(e.target.value)}
                placeholder="Opsional"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Komponen Bahan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="w-24">Jumlah</TableHead>
                  <TableHead className="text-right">Biaya Satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {componentTotals.map((component, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <select
                        className={selectClass}
                        value={component.bahanId}
                        onChange={(e) => updateComponent(index, "bahanId", e.target.value)}
                        required
                      >
                        <option value="">-- pilih bahan --</option>
                        {bahanList.map((bahan) => (
                          <option key={bahan.id} value={bahan.id}>
                            {bahan.nama}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={component.jumlah}
                        onChange={(e) => updateComponent(index, "jumlah", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(component.biaya)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(component.subtotal)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComponent(index)}
                        disabled={components.length === 1}
                        aria-label="Hapus baris"
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total Biaya Bahan
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatRupiah(totalBiayaBahan)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={addComponent}>
            <Plus />
            Tambah Bahan
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
          {message && <span className="text-sm text-destructive">{message}</span>}
          <span className="text-sm text-muted-foreground">
            Total Biaya Produk: {formatRupiah(totalBiayaProduk)}
          </span>
        </div>
      </form>
    </div>
  );
}
