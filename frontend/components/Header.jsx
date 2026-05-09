'use client'
import { useState } from 'react'

export default function Header(){
  const [open, setOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="site-brand"><a href="/">ERP Portfolio</a></div>
      <button className="mobile-toggle" aria-label="Toggle menu" onClick={()=>setOpen(o=>!o)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7H20" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12H20" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 17H20" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <nav className={"site-nav " + (open ? 'mobile-open' : '')}>
        <a href="/manufaktur">Manufaktur</a>
        <a href="/purchase/vendors">Purchase</a>
        <a href="/purchase/bills">Bills</a>
        <a href="/sales/customers">Sales</a>
        <a href="/sales/quotation">Quotation</a>
        <a href="/sales/orders">Sales Orders</a>
        <a href="/employees/departemen">Employees</a>
      </nav>
    </header>
  )
}
