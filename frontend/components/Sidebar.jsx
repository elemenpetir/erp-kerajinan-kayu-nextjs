'use client'

import { useState } from 'react'

const navSections = [
      { title: 'Manufaktur',
        items: [
          { label: 'Produk', href: '/manufaktur' },
          { label: 'Bahan', href: '/manufaktur/bahan' },
          { label: 'Kategori', href: '/manufaktur/kategori' },
          { label: 'BoM', href: '/manufaktur/bom' },
          { label: 'Order Produksi', href: '/manufaktur/order-produksi' }
        ]
      },
  {
    title: 'Purchase',
    items: [
      { label: 'Vendor', href: '/purchase/vendors' },
      { label: 'Bills', href: '/purchase/bills' }
    ]
  },
  {
    title: 'Sales',
    items: [
      { label: 'Customer', href: '/sales/customers' },
      { label: 'Quotation', href: '/sales/quotation' },
      { label: 'Sales Orders', href: '/sales/orders' }
    ]
  },
  {
    title: 'Accounting',
    items: [
      { label: 'Customer Invoice', href: '/accounting/invoices' },
      { label: 'Vendor Bill', href: '/accounting/bills' }
    ]
  },
  {
    title: 'Employees',
    items: [
      { label: 'Departemen', href: '/employees/departemen' },
      { label: 'Karyawan', href: '/employees/karyawan' }
    ]
  }
]

export default function Sidebar({ open, onClose }) {
  const [openSections, setOpenSections] = useState(
    navSections.reduce((acc, section) => ({ ...acc, [section.title]: false }), {})
  )

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-lg transition-transform duration-200 sm:static sm:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`}>
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Navigasi</p>
          <h2 className="text-xl font-semibold text-slate-900">ERP Menu</h2>
        </div>
        <button type="button" className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700 sm:hidden" onClick={onClose}>
          Tutup
        </button>
      </div>

      <nav className="space-y-4 sidebar-scroll">
        {navSections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              onClick={() => toggleSection(section.title)}
            >
              <span>{section.title}</span>
              <span className="ml-2 text-slate-500">{openSections[section.title] ? '−' : '+'}</span>
            </button>
            {openSections[section.title] && (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="block rounded-xl px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
