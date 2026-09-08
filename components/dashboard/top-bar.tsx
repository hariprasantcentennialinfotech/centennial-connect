'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Bell,
  Search,
  PhoneCall,
  Menu,
  CheckCircle2,
  Check,
  Shield,
  Volume2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TopBarProps {
  onMenuClick?: () => void
  user?: {
    name: string
    email: string
    avatarInitials?: string
  }
}

export function TopBar({ onMenuClick, user }: TopBarProps) {
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      title: 'AI Voice Agent Qualified Lead',
      description: 'Aria booked a demo with Mei Lin (Cascade Retail).',
      time: '12m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Power Dialer Campaign Finished',
      description: 'Q3 Renewals Outreach completed 168 calls with 34% conversion.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Database Synchronized',
      description: 'MongoDB Atlas connection established and collections synced.',
      time: '2h ago',
      unread: false,
    },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/70 bg-background/80 px-4 sm:px-6 backdrop-blur-md">
        {/* Left: Mobile menu toggle + Search */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>

          <div className="relative hidden w-64 md:w-80 sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search calls, contacts, numbers..."
              className="h-9 w-full rounded-xl bg-muted/50 pl-9 pr-3 text-xs focus-visible:ring-brand-primary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Telephony Gateway Status */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground">Telephony Gateway:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
          </div>

          {/* Quick Launch Power Dialer Button */}
          <Button
            asChild
            size="sm"
            className="h-9 gap-1.5 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm"
          >
            <Link href="/dashboard/power-dialer">
              <PhoneCall className="size-3.5" />
              <span className="hidden sm:inline">Launch Dialer</span>
            </Link>
          </Button>

          {/* Notifications Trigger */}
          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            className="relative flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {/* User Avatar */}
          <Link
            href="/dashboard/settings"
            className="flex size-9 items-center justify-center rounded-xl bg-brand-primary/10 text-xs font-bold text-brand-primary ring-1 ring-brand-primary/30 transition-transform hover:scale-105"
            title="Settings & Profile"
          >
            {user?.avatarInitials || user?.name?.slice(0, 2).toUpperCase() || 'CC'}
          </Link>
        </div>
      </header>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <DialogTitle className="text-base font-bold">Notifications</DialogTitle>
              <DialogDescription className="text-xs">
                Real-time telephony alerts & system events
              </DialogDescription>
            </div>
            {unreadCount > 0 ? (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </DialogHeader>

          <div className="space-y-2.5 py-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-xl p-3 text-xs transition-colors ${
                  n.unread
                    ? 'bg-brand-primary/5 border border-brand-primary/20'
                    : 'bg-muted/40 border border-border/60'
                }`}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  {n.id === 1 ? (
                    <Volume2 className="size-3.5" />
                  ) : n.id === 2 ? (
                    <PhoneCall className="size-3.5" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground leading-relaxed">{n.description}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
