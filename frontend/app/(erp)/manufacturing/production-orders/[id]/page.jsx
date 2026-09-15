"use client";
import { useEffect, useState, use } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/ui/StatusBadge";

const statusFlow = ["Draft", "Konfirmasi", "Dalam Proses", "Selesai"];

function Def({ label, children }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm font-medium">{children}</dd>
    </div>
  );
}

export default function OrderProduksiDetail({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_produksi")
      .select(
        "*, produk:produk_id(nama), bom:bom_id(id, internal_referensi, jumlah_produk, total_biaya_produk, total_biaya_bahan, components)",
      )
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setOrder(data);
    setLoading(false);
  }

  async function advanceStatus() {
    if (!order) return;
    const currentIndex = statusFlow.indexOf(order.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIndex + 1];
    setUpdating(true);
    const { error } = await supabase
      .from("order_produksi")
      .update({ status: nextStatus })
      .eq("id", id);
    if (error) toast.error("Gagal ubah status: " + error.message);
    else {
      toast.success(`Status menjadi ${nextStatus}`);
      fetchOrder();
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!order) return <p className="text-sm text-muted-foreground">Order Produksi tidak ditemukan</p>;

  const currentIndex = statusFlow.indexOf(order.status);
  const canAdvance = currentIndex >= 0 && currentIndex < statusFlow.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/manufacturing/production-orders" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Order Produksi</h1>
          <p className="text-sm text-muted-foreground">{order.produk?.nama || "-"}</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <Def label="Produk">{order.produk?.nama || "-"}</Def>
            <Def label="Jumlah">{order.jumlah_produk}</Def>
            <Def label="Status">
              <StatusBadge status={order.status} />
            </Def>
            <Def label="Tanggal">
              {order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID") : "-"}
            </Def>
            <Def label="BOM">{order.bom?.internal_referensi || order.bom?.id || "-"}</Def>
          </dl>
          <div className="mt-2 flex items-center gap-2">
            {statusFlow.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    i < currentIndex
                      ? "bg-emerald-600 text-white"
                      : i === currentIndex
                        ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
                {i < statusFlow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={advanceStatus} disabled={!canAdvance || updating}>
              {updating ? "Memproses..." : canAdvance ? `Ubah ke ${statusFlow[currentIndex + 1]}` : "Selesai"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Komponen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order.components || []).map((item, index) => {
                const jumlahTotal = (item.jumlah || 0) * (order.jumlah_produk || 1);
                const subtotal = (item.harga || 0) * jumlahTotal;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.nama_bahan}</TableCell>
                    <TableCell className="text-right tabular-nums">{jumlahTotal}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {(item.harga || 0).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{subtotal.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
