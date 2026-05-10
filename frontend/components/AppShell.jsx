'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header onMobileToggle={() => setSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
