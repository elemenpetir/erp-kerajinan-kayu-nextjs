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

const emptyItem = {
  bahan_id: "",
  nama_bahan: "",
  jumlah: 1,
  harga_satuan: 0,
  subtotal: 0,
};

export default function CreateBill() {
  const router = useRouter();
  const [vendorId, setVendorId] = useState("");
  const [vendors, setVendors] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [referensi, setReferensi] = useState("");
  const [deadline, setDeadline] = useState("");
  const [jenisPembayaran, setJenisPembayaran] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVendors();
    fetchBahan();
  }, []);

  async function fetchVendors() {
    const { data } = await supabase.from("vendor_individual").select("id, nama");
    setVendors(data || []);
  }

  async function fetchBahan() {
    const { data } = await supabase.from("bahan").select("id, nama, biaya");
    setBahanList(data || []);
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "bahan_id") {
      const bahan = bahanList.find((b) => b.id === value);
      if (bahan) {
        updated[index].nama_bahan = bahan.nama;
        updated[index].harga_satuan = bahan.biaya || 0;
      }
    }

    const jumlah = parseFloat(updated[index].jumlah) || 0;
    const harga = parseFloat(updated[index].harga_satuan) || 0;
    updated[index].subtotal = jumlah * harga;

    setItems(updated);
  }

  function addItem() {
    setItems([...items, { ...emptyItem }]);
  }

  function removeItem(index) {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  const totalBiaya = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();

    const itemsToSave = items
      .filter((item) => item.bahan_id)
      .map((item) => ({
        bahan_id: item.bahan_id,
        nama_bahan: item.nama_bahan,
        jumlah: parseFloat(item.jumlah),
        harga_satuan: parseFloat(item.harga_satuan),
        subtotal: item.subtotal,
      }));

    if (itemsToSave.length === 0) {
      toast.error("Tambahkan minimal satu bahan.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("bills").insert([
      {
        vendor_id: vendorId || null,
        referensi_vendor: referensi,
        deadline_order: deadline || null,
        jenis_pembayaran: jenisPembayaran || null,
        items: itemsToSave,
        total_biaya: totalBiaya,
        status: "Draft Bill",
      },
    ]);
    setSaving(false);

    if (error) {
      toast.error("Gagal simpan: " + error.message);
      return;
    }

    toast.success("Bill dibuat sebagai Draft");
    router.push("/purchase/bills");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/purchase/bills" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Buat Bill</h1>
          <p className="text-sm text-muted-foreground">Catat tagihan vendor sebagai Draft Bill.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Info tagihan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="vendor">Vendor</Label>
              <select id="vendor" className={selectClass} value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                <option value="">-- pilih --</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referensi">Referensi Vendor</Label>
              <Input id="referensi" value={referensi} onChange={(e) => setReferensi(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline Order</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jenis">Jenis Pembayaran</Label>
              <select id="jenis" className={selectClass} value={jenisPembayaran} onChange={(e) => setJenisPembayaran(e.target.value)}>
                <option value="">-- pilih --</option>
                <option value="Pembayaran Langsung">Pembayaran Langsung</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tempo">Tempo</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Bahan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="w-24">Jumlah</TableHead>
                  <TableHead className="w-36">Harga Satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <select
                        className={selectClass}
                        value={item.bahan_id}
                        onChange={(e) => handleItemChange(index, "bahan_id", e.target.value)}
                        required
                      >
                        <option value="">-- pilih bahan --</option>
                        {bahanList.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nama}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.jumlah}
                        onChange={(e) => handleItemChange(index, "jumlah", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.harga_satuan}
                        onChange={(e) => handleItemChange(index, "harga_satuan", e.target.value)}
                        required
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(item.subtotal)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
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
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatRupiah(totalBiaya)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={addItem}>
            <Plus />
            Tambah Bahan
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
