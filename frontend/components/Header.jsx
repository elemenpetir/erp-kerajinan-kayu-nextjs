'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Menu } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const SEGMENT_LABELS = {
  manufacturing: 'Manufaktur',
  products: 'Produk',
  materials: 'Bahan',
  categories: 'Kategori',
  boms: 'BoM',
  'production-orders': 'Order Produksi',
  purchase: 'Purchase',
  vendors: 'Vendor',
  bills: 'Bills',
  sales: 'Sales',
  customers: 'Customer',
  quotations: 'Quotation',
  'sales-orders': 'Sales Orders',
  accounting: 'Accounting',
  'customer-invoices': 'Customer Invoice',
  'vendor-bills': 'Vendor Bill',
  hr: 'HR',
  departments: 'Departemen',
  employees: 'Karyawan',
  new: 'Baru',
  reports: 'Laporan',
  stock: 'Stok',
  sales: 'Penjualan',
  finance: 'Keuangan',
}

// Rute yang benar-benar ada (punya page.jsx). Segmen intermediate
// (manufacturing, purchase, ...) BUKAN rute — tampil sebagai teks,
// bukan link mati. Sinkron dengan app/(erp) + /login.
const ROUTABLE_PREFIXES = [
  '/',
  '/login',
  '/manufacturing/products',
  '/manufacturing/materials',
  '/manufacturing/boms',
  '/manufacturing/categories',
  '/manufacturing/production-orders',
  '/purchase/vendors',
  '/purchase/bills',
  '/sales/customers',
  '/sales/quotations',
  '/sales/sales-orders',
  '/accounting/customer-invoices',
  '/accounting/vendor-bills',
  '/hr/departments',
  '/hr/employees',
  '/reports/stock',
  '/reports/sales',
  '/reports/finance',
];

function isRoutable(href) {
  return ROUTABLE_PREFIXES.some((r) => href === r || href.startsWith(r + '/'));
}

function crumbs(pathname) {
  const segs = (pathname || '/').split('/').filter(Boolean)
  return segs.map((seg, i) => {
    const href = '/' + segs.slice(0, i + 1).join('/')
    const isId = /^[0-9a-fA-F-]{8,}$/.test(seg)
    const linkable = !isId && isRoutable(href)
    return { href, label: isId ? 'Detail' : SEGMENT_LABELS[seg] || seg, last: i === segs.length - 1, linkable }
  })
}

export default function Header({ onMobileToggle }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''))
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const items = crumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMobileToggle} aria-label="Buka navigasi">
          <Menu />
        </Button>
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {items.map((c) => (
              <span key={c.href} className="inline-flex items-center gap-1.5">
                <BreadcrumbItem>
                  {c.last ? (
                    <BreadcrumbPage>{c.label}</BreadcrumbPage>
                  ) : c.linkable ? (
                    <BreadcrumbLink asChild>
                      <Link href={c.href}>{c.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <span className="text-muted-foreground">{c.label}</span>
                  )}
                </BreadcrumbItem>
                {!c.last && <BreadcrumbSeparator />}
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-0">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                {(email || '?').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-40 truncate md:inline">{email || 'Akun'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="max-w-56 truncate">{email || 'Akun'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
