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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const PAYMENT_TERMS = [
  "immediate payment",
  "15 hari",
  "30 hari",
  "45 hari",
  "2 bulan",
];

export default function CreateQuotation() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [expiration, setExpiration] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRefs();
  }, []);

  async function fetchRefs() {
    const { data: c } = await supabase.from("customer_individual").select("id,nama,email");
    const { data: p } = await supabase.from("produk").select("id,nama,harga_produksi");
    setCustomers(c || []);
    setProdukList(p || []);
  }

  function updateJumlah(idx, jumlah) {
    const updated = items.map((it, i) => {
      if (i !== idx) return it;
      const qty = parseFloat(jumlah) || 0;
      return { ...it, jumlah: qty, total_biaya: qty * it.satuan_biaya };
    });
    setItems(updated);
    recalc(updated);
  }

  function removeItem(idx) {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    recalc(updated);
  }

  function recalc(list) {
    setTotal(list.reduce((s, i) => s + parseFloat(i.total_biaya || 0), 0));
  }

  // ponytail: single addItem — merges duplicates by incrementing quantity
  // (the old file had two definitions; the second shadowed the first)
  function addItem(produkId) {
    if (!produkId) return;
    const p = produkList.find((pp) => pp.id === produkId);
    if (!p) return;
    const existingIdx = items.findIndex((it) => it.produk_id === produkId);
    if (existingIdx !== -1) {
      updateJumlah(existingIdx, items[existingIdx].jumlah + 1);
      return;
    }
    const updated = [
      ...items,
      {
        produk_id: p.id,
        nama_produk: p.nama,
        jumlah: 1,
        satuan_biaya: p.harga_produksi || 0,
        total_biaya: p.harga_produksi || 0,
      },
    ];
    setItems(updated);
    recalc(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Tambahkan minimal satu produk.");
      return;
    }
    const customer = customers.find((c) => c.id === customerId);
    setSaving(true);
    const { error } = await supabase.from("quotation").insert([
      {
        customer_id: customerId || null,
        customer_snapshot: { nama: customer?.nama, email: customer?.email },
        expiration: expiration || null,
        payment_terms: paymentTerms || null,
        items,
        total_biaya: total,
        status: "Quotation",
      },
    ]);
    setSaving(false);
    if (error) toast.error("Gagal simpan: " + error.message);
    else {
      toast.success("Quotation dibuat");
      router.push("/sales/quotations");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/sales/quotations" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Buat Quotation</h1>
          <p className="text-sm text-muted-foreground">Susun penawaran harga untuk customer.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-base">Info penawaran</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer</Label>
              <select
                id="customer"
                className={selectClass}
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- pilih --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiration">Expiration Date</Label>
              <Input
                id="expiration"
                type="date"
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="terms">Payment Terms</Label>
              <select
                id="terms"
                className={selectClass}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              >
                <option value="">-- pilih --</option>
                {PAYMENT_TERMS.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:col-span-3">
              <Label htmlFor="add-produk">Tambah Produk</Label>
              <select
                id="add-produk"
                className={selectClass}
                value=""
                onChange={(e) => {
                  addItem(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="">-- pilih produk --</option>
                {produkList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} — Rp {p.harga_produksi?.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="w-24">Jumlah</TableHead>
                  <TableHead className="text-right">Harga Satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Belum ada produk ditambahkan
                    </TableCell>
                  </TableRow>
                )}
                {items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{it.nama_produk}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={it.jumlah}
                        onChange={(e) => updateJumlah(idx, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      Rp {it.satuan_biaya?.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      Rp {it.total_biaya?.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)} aria-label="Hapus baris">
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {items.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      Rp {total.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </CardContent>
        </Card>
        <div>
          <Button type="submit" disabled={saving}>
            <Plus />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
