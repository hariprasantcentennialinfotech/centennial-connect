import Link from 'next/link'
import {
  ArrowRight,
  Hash,
  Bot,
  PhoneOutgoing,
  Globe,
  ShieldCheck,
  Zap,
  BarChart3,
  Headphones,
  Clock,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Counter, Reveal } from '@/components/motion'
import { Eyebrow, SectionHeading } from '@/components/marketing/primitives'
import { ProductPreview } from './product-preview'

/* --------------------------------- Hero --------------------------------- */

export function Hero() {
  return (
    <section className="px-4 pt-16 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <Eyebrow>Now with realtime AI voice agents</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              One platform for smarter business calling
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Virtual numbers, AI-powered voice agents, and intelligent power dialing — everything
              your sales and support teams need to connect with customers, in one place.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/register" />}>
                Start free trial
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 text-sm"
                render={<Link href="/contact" />}
              >
                Book a demo
              </Button>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-5 text-sm text-muted-foreground">
              No credit card required · 14-day trial · Cancel anytime
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="mt-16 sm:mt-20">
          <ProductPreview />
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------ Logos strip ------------------------------ */

const logos = ['Northwind', 'Brightpath', 'Cascade', 'Halcyon', 'Vertex', 'Summit']

export function LogosStrip() {
  return (
    <section className="px-4 pt-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Trusted by high-performing teams worldwide
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {logos.map((l) => (
            <span
              key={l}
              className="font-display text-lg font-bold tracking-tight text-foreground/35"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Products ------------------------------- */

const products = [
  {
    href: '/virtual-numbers',
    icon: Hash,
    tone: 'text-info bg-info/10',
    title: 'Virtual Numbers',
    description:
      'Get local, toll-free, and mobile numbers in 70+ countries. Route calls anywhere with instant provisioning.',
    points: ['70+ countries', 'Instant setup', 'SMS + voice'],
  },
  {
    href: '/voice-agent',
    icon: Bot,
    tone: 'text-violet bg-violet/10',
    title: 'AI Voice Agent',
    description:
      'Human-like AI that answers, qualifies, and books — around the clock. Configure once, scale infinitely.',
    points: ['24/7 availability', 'Natural voices', 'Auto-qualify'],
  },
  {
    href: '/power-dialer',
    icon: PhoneOutgoing,
    tone: 'text-success bg-success/10',
    title: 'Power Dialer',
    description:
      'Automatically dial through lists, skip busy tones, and connect reps only to live conversations.',
    points: ['3x more connects', 'Smart routing', 'Live analytics'],
  },
]

export function Products() {
  return (
    <section id="products" className="px-4 pt-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Products"
          title="Three products. One connected platform."
          description="Each product works beautifully on its own — and even better together, sharing numbers, contacts, and analytics."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <Link
                href={p.href}
                className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className={`inline-flex size-12 items-center justify-center rounded-xl ${p.tone}`}>
                  <p.icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <ul className="mt-5 flex flex-col gap-2">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="size-4 text-success" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-bright">
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Features ------------------------------- */

const features = [
  { icon: Globe, title: 'Global coverage', description: 'Numbers and routing across 70+ countries with local presence everywhere.' },
  { icon: Zap, title: 'Instant provisioning', description: 'Spin up numbers and agents in seconds — no telecom paperwork.' },
  { icon: ShieldCheck, title: 'Enterprise security', description: 'SOC 2 Type II, end-to-end encryption, and granular role controls.' },
  { icon: BarChart3, title: 'Unified analytics', description: 'One dashboard for every call, agent, and campaign across products.' },
  { icon: Headphones, title: 'Live + AI blend', description: 'Seamlessly hand off between AI agents and your human team.' },
  { icon: Clock, title: '99.99% uptime', description: 'Carrier-grade infrastructure built for mission-critical calling.' },
]

export function Features() {
  return (
    <section className="px-4 pt-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Why Centennial Connect"
          title="Built for teams that live on the phone"
          description="The reliability of carrier infrastructure with the speed and intelligence of modern software."
        />
        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80}>
              <div className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* -------------------------------- Stats --------------------------------- */

const stats = [
  { value: 12, suffix: 'M+', label: 'Calls connected monthly' },
  { value: 70, suffix: '+', label: 'Countries covered' },
  { value: 99, suffix: '.99%', label: 'Platform uptime' },
  { value: 3, suffix: 'x', label: 'More connects with dialer' },
]

export function Stats() {
  return (
    <section className="px-4 pt-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 rounded-3xl border border-border/70 bg-primary p-8 text-primary-foreground shadow-[var(--shadow-card)] sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-primary-foreground/70">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------------------------------- CTA ---------------------------------- */

export function CTASection() {
  return (
    <section className="px-4 pt-28">
      <div className="mx-auto max-w-4xl">
        <Reveal className="overflow-hidden rounded-3xl border border-border/70 bg-card p-10 text-center shadow-[var(--shadow-card)] sm:p-14">
          <SectionHeading
            title="Ready to connect smarter?"
            description="Start your free trial today and put virtual numbers, AI voice agents, and power dialing to work in minutes."
          />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/register" />}>
              Start free trial
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-sm"
              render={<Link href="/pricing" />}
            >
              View pricing
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
