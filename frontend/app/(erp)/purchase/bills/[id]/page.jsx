"use client";
import { useEffect, useState } from "react";
import { use } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatRupiah } from "../../../../../lib/utils/format";
import { confirmBill, deleteBill } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import ActionButton from "@/components/ui/ActionButton";

function Def({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{children}</dd>
    </div>
  );
}

export default function BillDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [bill, setBill] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, [id]);

  async function fetchBill() {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      toast.error("Bill tidak ditemukan");
      router.push("/purchase/bills");
      return;
    }

    setBill(data);

    if (data.vendor_id) {
      const { data: vInd } = await supabase
        .from("vendor_individual")
        .select("nama")
        .eq("id", data.vendor_id)
        .single();
      if (vInd) setVendor(vInd.nama);
      else {
        const { data: vCo } = await supabase
          .from("vendor_company")
          .select("nama")
          .eq("id", data.vendor_id)
          .single();
        if (vCo) setVendor(vCo.nama);
      }
    }

    setLoading(false);
  }

  async function handleKonfirmasi() {
    await confirmBill(id);
    fetchBill();
  }

  async function handleBayar() {
    const { error } = await supabase.rpc("pay_bill", { p_bill_id: id });
    if (error) throw new Error(error.message);
    toast.success("Bill berhasil dibayar!");
    fetchBill();
  }

  async function handleDelete() {
    await deleteBill(id);
    router.push("/purchase/bills");
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
  if (!bill) return null;

  const items = bill.items || [];

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          nav, aside, .no-print { display: none !important; }
          body { background: white !important; }
          button, a { display: none !important; }
        }
      `}</style>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/purchase/bills" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Detail Bill</h1>
          <p className="text-sm text-muted-foreground">{bill.referensi_vendor || "-"}</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">Informasi</CardTitle>
          <div className="no-print flex flex-wrap gap-2">
            {bill.status === "Draft Bill" && (
              <ActionButton
                run={handleKonfirmasi}
                confirmTitle="Konfirmasi bill?"
                confirmText="Konfirmasi bill ini?"
                label="Konfirmasi"
                variant="secondary"
              />
            )}
            {bill.status === "Bill" && (
              <ActionButton
                run={handleBayar}
                confirmTitle="Bayar bill?"
                confirmText="Bayar bill ini? Data akan masuk ke Vendor Bill Accounting."
                label="Bayar"
              />
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer />
              Print
            </Button>
            {bill.status === "Draft Bill" && (
              <ActionButton
                run={handleDelete}
                confirmTitle="Hapus bill?"
                confirmText="Hapus bill ini?"
                label="Hapus"
                variant="destructive"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <Def label="Vendor">{vendor || "-"}</Def>
            <Def label="Referensi">{bill.referensi_vendor || "-"}</Def>
            <Def label="Deadline">{bill.deadline_order || "-"}</Def>
            <Def label="Jenis Pembayaran">{bill.jenis_pembayaran || "-"}</Def>
            <Def label="Status">
              <StatusBadge status={bill.status} />
            </Def>
          </dl>
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
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama Bahan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Tidak ada item.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{item.nama_bahan}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.jumlah}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(item.harga_satuan)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatRupiah(item.subtotal)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatRupiah(bill.total_biaya)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
