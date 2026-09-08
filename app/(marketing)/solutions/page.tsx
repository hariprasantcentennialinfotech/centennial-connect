import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  TrendingUp,
  Headphones,
  Building2,
  Users,
  Hash,
  Bot,
  PhoneOutgoing,
  Check,
  BarChart3,
  Globe,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion'
import { SectionHeading } from '@/components/marketing/primitives'

export const metadata: Metadata = {
  title: 'Solutions',
  description:
    'Discover how Centennial Connect powers sales teams, support teams, agencies, and enterprises with intelligent calling solutions.',
}

const solutions = [
  {
    icon: TrendingUp,
    tone: 'text-info bg-info/10',
    title: 'Sales Teams',
    description:
      'Accelerate pipeline with power dialing, AI-assisted outreach, and local presence dialing. Connect reps to 3x more live conversations every day.',
    products: ['Power Dialer', 'Virtual Numbers', 'AI Voice Agent'],
    benefits: [
      'Automated outbound calling workflows',
      'Local presence with virtual numbers',
      'AI-powered lead qualification',
      'Real-time sales analytics',
      'CRM-ready call logging',
    ],
    href: '/power-dialer',
  },
  {
    icon: Headphones,
    tone: 'text-violet bg-violet/10',
    title: 'Support Teams',
    description:
      'Deliver exceptional customer experiences with AI-powered inbound handling, intelligent routing, and 24/7 availability through voice agents.',
    products: ['AI Voice Agent', 'Virtual Numbers'],
    benefits: [
      '24/7 AI-powered call handling',
      'Intelligent call routing and transfers',
      'Automated ticket creation',
      'Multilingual voice support',
      'Real-time sentiment analysis',
    ],
    href: '/voice-agent',
  },
  {
    icon: Building2,
    tone: 'text-success bg-success/10',
    title: 'Agencies',
    description:
      'Manage multiple client campaigns from a single platform. Provision numbers, run outbound campaigns, and track performance across accounts.',
    products: ['Power Dialer', 'Virtual Numbers', 'AI Voice Agent'],
    benefits: [
      'Multi-client campaign management',
      'White-label number provisioning',
      'Per-client analytics and reporting',
      'Scalable agent seats',
      'Consolidated billing',
    ],
    href: '/pricing',
  },
  {
    icon: Users,
    tone: 'text-amber bg-amber/15',
    title: 'Enterprise',
    description:
      'Enterprise-grade security, compliance, and scale. Deploy across departments with SSO, role-based access, and dedicated infrastructure.',
    products: ['Virtual Numbers', 'AI Voice Agent', 'Power Dialer'],
    benefits: [
      'SOC 2 Type II compliance',
      'SSO and SAML integration',
      'Role-based access controls',
      'Dedicated account management',
      '99.99% uptime SLA',
    ],
    href: '/contact',
  },
]

const productMap = {
  'Virtual Numbers': { icon: Hash, tone: 'text-info' },
  'AI Voice Agent': { icon: Bot, tone: 'text-violet' },
  'Power Dialer': { icon: PhoneOutgoing, tone: 'text-success' },
} as const

const platformFeatures = [
  { icon: Globe, title: 'Global coverage', description: 'Numbers in 70+ countries with local presence dialing.' },
  { icon: ShieldCheck, title: 'Enterprise security', description: 'SOC 2 Type II, encryption, and role-based access.' },
  { icon: Zap, title: 'Instant setup', description: 'Provision numbers and launch campaigns in minutes.' },
  { icon: BarChart3, title: 'Unified analytics', description: 'One dashboard across all products and campaigns.' },
]

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Reveal>
              <SectionHeading
                eyebrow="Solutions"
                title="Built for every team that lives on the phone"
                description="Whether you're scaling outbound sales, automating support, or managing multi-client campaigns — Centennial Connect adapts to your workflow."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Solution cards */}
      <section className="px-4 pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-2">
            {solutions.map((s, i) => (
              <Reveal key={s.title} delay={i * 80}>
                <div className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${s.tone}`}>
                      <s.icon className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.products.map((p) => {
                      const prod = productMap[p as keyof typeof productMap]
                      return (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-foreground/80"
                        >
                          <prod.icon className={`size-3.5 ${prod.tone}`} />
                          {p}
                        </span>
                      )
                    })}
                  </div>

                  <ul className="mt-5 flex flex-1 flex-col gap-2">
                    {s.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button variant="outline" size="lg" render={<Link href={s.href} />}>
                      Learn more
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform features strip */}
      <section className="px-4 pt-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Platform"
            title="One platform, every workflow"
            description="All solutions share a unified infrastructure with enterprise-grade capabilities."
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="overflow-hidden rounded-3xl border border-border/70 bg-card p-10 text-center shadow-[var(--shadow-card)] sm:p-14">
            <SectionHeading
              title="Not sure which solution fits?"
              description="Talk to our team. We'll map Centennial Connect to your exact workflow in a 20-minute discovery call."
            />
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/contact" />}>
                Book a discovery call
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm" render={<Link href="/pricing" />}>
                View pricing
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
