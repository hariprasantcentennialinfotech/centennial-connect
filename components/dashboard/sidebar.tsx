'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Hash,
  Bot,
  PhoneOutgoing,
  Users,
  PhoneCall,
  BarChart3,
  Settings,
  LogOut,
  Database,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Virtual Numbers', href: '/dashboard/virtual-numbers', icon: Hash, badge: '4' },
  { name: 'Voice Agent', href: '/dashboard/voice-agent', icon: Bot, badge: 'AI' },
  { name: 'Power Dialer', href: '/dashboard/power-dialer', icon: PhoneOutgoing },
  { name: 'Contacts', href: '/dashboard/contacts', icon: Users },
  { name: 'Call History', href: '/dashboard/calls', icon: PhoneCall },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface SidebarProps {
  user?: {
    name: string
    email: string
    avatarInitials?: string
    role?: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/80 bg-card/60 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-5 border-b border-border/60">
        <Logo href="/dashboard" />
      </div>

      {/* Database Status Indicator */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
          <div className="flex items-center gap-1.5 font-medium">
            <Database className="size-3.5" />
            <span>MongoDB Connected</span>
          </div>
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Platform
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20 font-semibold'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'size-4.5 transition-colors',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge === 'AI'
                      ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>

      {/* Upgrade / Telephony pill */}
      <div className="p-3">
        <div className="rounded-xl border border-brand-primary/20 bg-gradient-to-b from-brand-primary/10 to-transparent p-3.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-brand-primary">
            <Sparkles className="size-3.5" />
            <span>Growth Plan Active</span>
          </div>
          <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
            Unlimited AI Voice Agent hours & 25 Virtual Numbers included.
          </p>
          <Link
            href="/dashboard/settings"
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Manage subscription <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-muted/60 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary font-display text-xs font-bold text-white shadow-sm">
              {user?.avatarInitials || user?.name?.slice(0, 2).toUpperCase() || 'CC'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {user?.name || 'Administrator'}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email || 'admin@centennial.io'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
