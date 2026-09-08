'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  Hash,
  Bot,
  PhoneOutgoing,
  Menu,
  X,
} from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const products = [
  {
    href: '/virtual-numbers',
    title: 'Virtual Numbers',
    description: 'Global business numbers without telecom complexity.',
    icon: Hash,
    tone: 'text-info bg-info/10',
  },
  {
    href: '/voice-agent',
    title: 'AI Voice Agent',
    description: 'Automate inbound and outbound conversations.',
    icon: Bot,
    tone: 'text-violet bg-violet/10',
  },
  {
    href: '/power-dialer',
    title: 'Power Dialer',
    description: 'Reach more prospects with intelligent dialing.',
    icon: PhoneOutgoing,
    tone: 'text-success bg-success/10',
  },
]

const links = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/resources', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [productsOpen, setProductsOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setMobileOpen(false)
    setProductsOpen(false)
  }, [pathname])

  const openProducts = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setProductsOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setProductsOpen(false), 120)
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/85 px-4 py-3 shadow-[var(--shadow-nav)] backdrop-blur-md sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={openProducts}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              aria-expanded={productsOpen}
              onClick={() => setProductsOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Products
              <ChevronDown
                className={cn('size-4 transition-transform', productsOpen && 'rotate-180')}
              />
            </button>
            {productsOpen ? (
              <div className="absolute left-0 top-full pt-2">
                <div className="w-[360px] rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-card-hover)] animate-in fade-in slide-in-from-top-1">
                  {products.map((p) => (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
                    >
                      <span className={cn('flex size-9 items-center justify-center rounded-lg', p.tone)}>
                        <p.icon className="size-5" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{p.title}</span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {p.description}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground',
                pathname === l.href ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" size="lg" render={<Link href="/login" />}>
            Login
          </Button>
          <Button size="lg" className="h-9 px-4" render={<Link href="/register" />}>
            Get Started
          </Button>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card-hover)] lg:hidden">
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Products
          </p>
          {products.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
            >
              <span className={cn('flex size-8 items-center justify-center rounded-lg', p.tone)}>
                <p.icon className="size-4" />
              </span>
              <span className="text-sm font-semibold text-foreground">{p.title}</span>
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 p-1">
            <Button variant="outline" size="lg" render={<Link href="/login" />}>
              Login
            </Button>
            <Button size="lg" render={<Link href="/register" />}>
              Get Started
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  )
}
