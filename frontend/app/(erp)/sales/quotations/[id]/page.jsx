"use client";
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { deleteQuotation } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import ActionButton from "@/components/ui/ActionButton";


export default function QuotationDetail({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [q, setQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotation")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setQ(data);
    setLoading(false);
  }

  async function handleDelete() {
    await deleteQuotation(id);
    router.push("/sales/quotations");
  }

  async function handleConfirm() {
    const { error } = await supabase.rpc("confirm_quotation", { p_q_id: id });
    if (error) throw new Error(error.message);
    toast.success("Berhasil! Sales Order telah dibuat.");
    fetchData();
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
  if (!q) return <p className="text-sm text-muted-foreground">Quotation tidak ditemukan</p>;

  const isDraft = q.status === "Quotation";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/sales/quotations" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Detail Quotation</h1>
          <p className="text-sm text-muted-foreground">{q.customer_snapshot?.nama || "-"}</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">Informasi</CardTitle>
          <div className="flex gap-2">
            {isDraft && (
              <ActionButton
                run={handleDelete}
                confirmTitle="Hapus quotation?"
                confirmText="Hapus quotation ini?"
                label="Hapus"
                variant="destructive"
              />
            )}
            {isDraft && (
              <ActionButton
                run={handleConfirm}
                confirmTitle="Konfirmasi quotation?"
                confirmText="Konfirmasi quotation ini menjadi Sales Order?"
                label="Konfirmasi Sales Order"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <Def label="Customer">{q.customer_snapshot?.nama || "-"}</Def>
            <Def label="Email">{q.customer_snapshot?.email || "-"}</Def>
            <Def label="Payment Terms">{q.payment_terms || "-"}</Def>
            <Def label="Expiration">{q.expiration || "-"}</Def>
            <Def label="Status">
              <StatusBadge status={q.status} />
            </Def>
            <Def label="Tanggal">
              {q.created_at ? new Date(q.created_at).toLocaleDateString("id-ID") : "-"}
            </Def>
          </dl>
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
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(q.items || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Tidak ada item
                  </TableCell>
                </TableRow>
              )}
              {(q.items || []).map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{it.nama_produk}</TableCell>
                  <TableCell className="text-right tabular-nums">{it.jumlah}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    Rp {Number(it.satuan_biaya || 0).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    Rp {Number(it.total_biaya || 0).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-right font-semibold">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  Rp {Number(q.total_biaya || 0).toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Alur berikutnya
        <ArrowRight className="h-4 w-4" />
        {isDraft ? "konfirmasi untuk membuat Sales Order" : "sudah menjadi Sales Order"}
      </div>
    </div>
  );
}
