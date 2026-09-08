'use client'

import * as React from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopBar } from '@/components/dashboard/top-bar'
import { X } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Demo user data or loaded from session
  const user = {
    name: 'Alex Morgan',
    email: 'alex@northwind.co',
    avatarInitials: 'AM',
    role: 'owner',
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-brand-primary selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar user={user} />
      </div>

      {/* Mobile Drawer Backdrop + Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card shadow-2xl">
            <div className="absolute right-2 top-3 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted"
                aria-label="Close sidebar"
              >
                <X className="size-5" />
              </button>
            </div>
            <Sidebar user={user} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
