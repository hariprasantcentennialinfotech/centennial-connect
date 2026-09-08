import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/brand/logo'

const columns = [
  {
    title: 'Products',
    links: [
      { label: 'Virtual Numbers', href: '/virtual-numbers' },
      { label: 'AI Voice Agent', href: '/voice-agent' },
      { label: 'Power Dialer', href: '/power-dialer' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Solutions', href: '/solutions' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact', href: '/contact' },
      { label: 'Login', href: '/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/resources' },
      { label: 'Terms', href: '/resources' },
      { label: 'Security', href: '/resources' },
      { label: 'Status', href: '/resources' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="px-4 pb-8 pt-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 rounded-3xl border border-border/70 bg-card p-8 shadow-[var(--shadow-card)] sm:p-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One platform for smarter business calling. Virtual numbers, AI voice agents, and
              power dialing for modern sales and support teams.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Centennial Connect. All rights reserved.
          </p>
          <a
            href="https://centennialinfotech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Powered by Centennial InfoTech
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
