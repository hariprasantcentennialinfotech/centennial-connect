import { SiteFooter } from '@/components/marketing/site-footer'
import { SiteHeader } from '@/components/marketing/site-header'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_70%_-10%,color-mix(in_oklch,var(--brand-bright)_14%,transparent),transparent),radial-gradient(50rem_30rem_at_0%_10%,color-mix(in_oklch,var(--info)_10%,transparent),transparent)]"
      />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
