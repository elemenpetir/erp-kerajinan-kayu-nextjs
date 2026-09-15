'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMobileToggle={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-full space-y-4">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
