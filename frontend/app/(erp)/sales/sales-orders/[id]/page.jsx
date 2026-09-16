"use client";
import { Def } from '@/components/ui/DefinitionList';
import { useEffect, useState, use } from "react";
import { ArrowLeft, Check, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../../../../lib/supabase/client";
import { markDelivered } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import ActionButton from "@/components/ui/ActionButton";


export default function SalesOrderDetail({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales_order")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setOrder(data);
    setLoading(false);
  }

  async function handleCreateInvoice() {
    const { error } = await supabase.rpc("invoice_sales_order", { p_so_id: id });
    if (error) throw new Error(error.message);
    toast.success("Invoice berhasil dibuat!");
    fetchData();
  }

  async function handleMarkDelivered() {
    await markDelivered(id);
    toast.success("Pengiriman ditandai Terkirim");
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
  if (!order) return <p className="text-sm text-muted-foreground">Sales Order tidak ditemukan</p>;

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
          <a href="/sales/sales-orders" aria-label="Kembali">
            <ArrowLeft />
          </a>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Detail Sales Order</h1>
          <p className="text-sm text-muted-foreground">{order.customer_snapshot?.nama || "-"}</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <CardTitle className="text-base">Informasi</CardTitle>
          <div className="no-print flex flex-wrap gap-2">
            {order.status_delivery === "Sedang Dikirim" && (
              <ActionButton
                run={handleMarkDelivered}
                confirmTitle="Tandai terkirim?"
                confirmText="Tandai pengiriman sebagai Terkirim?"
                label="Tandai Terkirim"
                variant="secondary"
              />
            )}
            {order.status === "To Invoice" && (
              <ActionButton
                run={handleCreateInvoice}
                confirmTitle="Buat invoice?"
                confirmText="Buat invoice untuk Sales Order ini?"
                label="Buat Invoice"
              />
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer />
              Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <dl className="divide-y">
            <Def label="Customer">{order.customer_snapshot?.nama || "-"}</Def>
            <Def label="Email">{order.customer_snapshot?.email || "-"}</Def>
            <Def label="Payment Terms">{order.payment_terms || "-"}</Def>
            <Def label="Expiration">{order.expiration || "-"}</Def>
            <Def label="Status">
              <StatusBadge status={order.status} />
            </Def>
            <Def label="Status Pengiriman">
              {order.status_delivery === "Terkirim" ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                  <Check className="h-4 w-4" />
                  Terkirim
                </span>
              ) : (
                order.status_delivery || "-"
              )}
            </Def>
            <Def label="Tanggal">
              {order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID") : "-"}
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
              {(order.items || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Tidak ada item
                  </TableCell>
                </TableRow>
              )}
              {(order.items || []).map((it, idx) => (
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
                  Rp {Number(order.total_biaya || 0).toLocaleString("id-ID")}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
