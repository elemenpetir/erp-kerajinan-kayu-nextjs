"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navSections = [
  {
    title: "Manufaktur",
    items: [
      { label: "Produk", href: "/manufaktur" },
      { label: "Bahan", href: "/manufaktur/bahan" },
      { label: "Kategori", href: "/manufacturing/categories" },
      { label: "BoM", href: "/manufaktur/bom" },
      { label: "Order Produksi", href: "/manufacturing/production-orders" },
    ],
  },
  {
    title: "Purchase",
    items: [
      { label: "Vendor", href: "/purchase/vendors" },
      { label: "Bills", href: "/purchase/bills" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Customer", href: "/sales/customers" },
      { label: "Quotation", href: "/sales/quotations" },
      { label: "Sales Orders", href: "/sales/sales-orders" },
    ],
  },
  {
    title: "Accounting",
    items: [
      { label: "Customer Invoice", href: "/accounting/invoices" },
      { label: "Vendor Bill", href: "/accounting/bills" },
    ],
  },
  {
    title: "Employees",
    items: [
      { label: "Departemen", href: "/hr/departments" },
      { label: "Karyawan", href: "/hr/employees" },
    ],
  },
];

function isActive(href, pathname) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState(
    navSections.reduce(
      (acc, section) => ({ ...acc, [section.title]: false }),
      {},
    ),
  );

  // Auto-expand section berisi halaman aktif (toggle manual tetap bisa)
  useEffect(() => {
    const active = navSections.find((s) =>
      s.items.some((item) => isActive(item.href, pathname)),
    );
    if (active) {
      setOpenSections((prev) =>
        prev[active.title] ? prev : { ...prev, [active.title]: true },
      );
    }
  }, [pathname]);

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-lg transition-transform duration-200 lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Navigasi
          </p>
          <h2 className="text-xl font-semibold text-slate-900">ERP Menu</h2>
        </div>
        <button
          type="button"
          className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700 lg:hidden"
          onClick={onClose}
        >
          Tutup
        </button>
      </div>

      <nav className="space-y-4 sidebar-scroll">
        {navSections.map((section) => {
          const sectionActive = section.items.some((item) =>
            isActive(item.href, pathname),
          );
          return (
          <div
            key={section.title}
            className={`rounded-2xl border bg-white p-3 shadow-sm ${sectionActive ? "border-slate-900" : "border-slate-200"}`}
          >
            <button
              type="button"
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition hover:bg-slate-50 ${sectionActive ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800" : "border-slate-200 bg-white text-slate-900"}`}
              onClick={() => toggleSection(section.title)}
            >
              <span>{section.title}</span>
              <span className={`ml-2 ${sectionActive ? "text-slate-300" : "text-slate-500"}`}>
                {openSections[section.title] ? "−" : "+"}
              </span>
            </button>
            {openSections[section.title] && (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {section.items.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-xl px-3 py-2 transition ${active ? "bg-slate-900 font-semibold text-white" : "hover:bg-slate-100 hover:text-slate-900"}`}
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
    </aside>
  );
}
