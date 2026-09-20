"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Calculator,
  ChevronDown,
  Factory,
  FileText,
  Handshake,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

const navSections = [
  {
    title: "Manufaktur",
    icon: Factory,
    items: [
      { label: "Produk", href: "/manufacturing/products" },
      { label: "Bahan", href: "/manufacturing/materials" },
      { label: "Kategori", href: "/manufacturing/categories" },
      { label: "BoM", href: "/manufacturing/boms" },
      { label: "Order Produksi", href: "/manufacturing/production-orders" },
    ],
  },
  {
    title: "Purchase",
    icon: ShoppingCart,
    items: [
      { label: "Vendor", href: "/purchase/vendors" },
      { label: "Bills", href: "/purchase/bills" },
    ],
  },
  {
    title: "Sales",
    icon: Handshake,
    items: [
      { label: "Customer", href: "/sales/customers" },
      { label: "Quotation", href: "/sales/quotations" },
      { label: "Sales Orders", href: "/sales/sales-orders" },
    ],
  },
  {
    title: "Accounting",
    icon: Calculator,
    items: [
      { label: "Customer Invoice", href: "/accounting/customer-invoices" },
      { label: "Vendor Bill", href: "/accounting/vendor-bills" },
    ],
  },
  {
    title: "Employees",
    icon: Users,
    items: [
      { label: "Departemen", href: "/hr/departments" },
      { label: "Karyawan", href: "/hr/employees" },
    ],
  },
  {
    title: "Laporan",
    icon: FileText,
    items: [
      { label: "Stok", href: "/reports/stock" },
      { label: "Penjualan", href: "/reports/sales" },
      { label: "Keuangan", href: "/reports/finance" },
    ],
  },
];

function isActive(href, pathname) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

// Jika beberapa href cocok (prefix), hanya yang terpanjang yang aktif.
function findActiveHref(pathname) {
  if (!pathname) return null;
  let best = null;
  for (const s of navSections) {
    for (const item of s.items) {
      if (isActive(item.href, pathname) && (!best || item.href.length > best.length)) {
        best = item.href;
      }
    }
  }
  return best;
}

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const activeHref = findActiveHref(pathname);
  const [openSections, setOpenSections] = useState(
    navSections.reduce((acc, section) => ({ ...acc, [section.title]: false }), {}),
  );

  // Auto-expand section berisi halaman aktif (toggle manual tetap bisa)
  useEffect(() => {
    if (!activeHref) return;
    const active = navSections.find((s) => s.items.some((item) => item.href === activeHref));
    if (active) {
      setOpenSections((prev) => (prev[active.title] ? prev : { ...prev, [active.title]: true }));
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <a href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </span>
            <span className="truncate text-sm font-semibold tracking-wide">
              ERP Kerajinan Kayu
            </span>
          </a>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Tutup navigasi">
            <X />
          </Button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3 sidebar-scroll">
          {navSections.map((section) => {
            const sectionActive = section.items.some((item) => item.href === activeHref);
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={openSections[section.title]}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    sectionActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{section.title}</span>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 transition-transform", openSections[section.title] && "rotate-180")}
                  />
                </button>
                {openSections[section.title] && (
                  <ul className="mb-1 ml-5 mt-1 space-y-0.5 border-l pl-3">
                    {section.items.map((item) => {
                      const active = item.href === activeHref;
                      return (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={onClose}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                              active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground",
                            )}
                          >
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t p-3 text-xs text-muted-foreground">
          Next.js + Supabase
        </div>
      </aside>
    </>
  );
}
