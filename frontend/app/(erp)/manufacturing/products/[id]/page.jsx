"use client";
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from "react";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { deleteProduct } from "../actions";
import { formatRupiah } from "../../../../../lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ActionButton from "@/components/ui/ActionButton";
import FilePicker from "@/components/ui/FilePicker";
import { uploadImage } from "@/lib/storage/upload";


export default function ProdukDetail({ params }) {
  const { id } = use(params);
  const [produk, setProduk] = useState(null);
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingHarga, setEditingHarga] = useState(false);
  const [harga, setHarga] = useState("");

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchProduk(), fetchBom()]);
    setLoading(false);
  }

  async function fetchProduk() {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else {
      setProduk(data);
      setHarga(data.harga_produksi || "");
    }
  }

  async function fetchBom() {
    const { data } = await supabase
      .from("bom")
      .select("*")
      .eq("produk_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setBom(data || null);
  }

  async function handleUpdateHarga(e) {
    e.preventDefault();
    const parsed = parseFloat(harga);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Harga harus angka ≥ 0.");
      return;
    }
    const { error } = await supabase
      .from("produk")
      .update({ harga_produksi: parsed })
      .eq("id", id);
    if (error) {
      toast.error("Gagal update harga: " + error.message);
      return;
    }
    toast.success("Harga diperbarui");
    setEditingHarga(false);
    fetchProduk();
  }

  async function handleDelete() {
    await deleteProduct(id);
    window.location.href = "/manufacturing/products";
  }

  async function handleFoto(f) {
    if (!f) return;
    try {
      const url = await uploadImage("produk-images", f);
      const { error } = await supabase.from("produk").update({ gambar_url: url }).eq("id", id);
      if (error) throw new Error(error.message);
      toast.success("Foto diperbarui");
      fetchProduk();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!produk) return <p className="text-sm text-muted-foreground">Produk tidak ditemukan</p>;

  const hargaJual = parseFloat(produk.harga_produksi || 0);
  const biayaProduksi = bom ? parseFloat(bom.total_biaya_bahan || 0) : null;
  const margin = biayaProduksi !== null ? hargaJual - biayaProduksi : null;
  const isRugi = margin !== null && margin < 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/products" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{produk.nama}</h1>
          <p className="text-sm text-muted-foreground">Detail produk</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foto</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4 pt-0">
          {produk.gambar_url ? (
            <img src={produk.gambar_url} alt={produk.nama} className="h-24 w-24 rounded-md object-cover" />
          ) : (
            <span className="text-sm text-muted-foreground">Belum ada foto</span>
          )}
          <FilePicker onSelect={handleFoto} className="w-full max-w-xs" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="divide-y pt-0">
          <Def label="Nama">{produk.nama}</Def>
          <Def label="Harga Jual">
            {editingHarga ? (
              <form onSubmit={handleUpdateHarga} className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  className="w-40"
                  autoFocus
                />
                <Button size="sm" type="submit">
                  Simpan
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => { setHarga(produk.harga_produksi || ""); setEditingHarga(false); }}>
                  Batal
                </Button>
              </form>
            ) : (
              <span className="inline-flex items-center gap-2">
                {formatRupiah(hargaJual)}
                {/* h-6 agar sejajar baris teks (24+16=40px) — jangan besarkan tanpa sesuaikan Def */}
                <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditingHarga(true)}>
                  Edit
                </Button>
              </span>
            )}
          </Def>
          <Def label="Biaya Produksi">
            {biayaProduksi !== null ? formatRupiah(biayaProduksi) : <span className="text-muted-foreground">Belum ada BOM</span>}
          </Def>
          {margin !== null && (
            <Def label="Margin">
              <span className={isRugi ? "font-semibold text-destructive" : "font-semibold text-emerald-600"}>
                {formatRupiah(margin)}
              </span>
              {isRugi && (
                <span className="ml-2 inline-flex items-center gap-1 text-sm text-destructive">
                  <TriangleAlert className="h-4 w-4" />
                  Harga jual lebih rendah dari biaya produksi!
                </span>
              )}
            </Def>
          )}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={bom ? `/manufacturing/boms/${bom.id}` : `/manufacturing/boms/new?produk_id=${id}`}>
            {bom ? "Lihat BOM" : "+ Buat BOM"}
          </a>
        </Button>
        <ActionButton
          run={handleDelete}
          confirmTitle="Hapus produk?"
          confirmText="Hapus produk ini? BOM terkait ikut terhapus."
          label="Hapus Produk"
          variant="destructive"
        />
      </div>
    </div>
  );
}
