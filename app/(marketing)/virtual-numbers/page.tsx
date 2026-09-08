'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Globe,
  Hash,
  Phone,
  PhoneForwarded,
  Search,
  Shield,
  Signal,
  HelpCircle,
  MapPin,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion'
import { SectionHeading, Eyebrow } from '@/components/marketing/primitives'
import { countries, searchableNumbers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const features = [
  { icon: Globe, title: 'International numbers', description: 'Local and toll-free numbers across 70+ countries.' },
  { icon: Shield, title: 'Business caller ID', description: 'Display your business identity on every outbound call.' },
  { icon: Phone, title: 'Inbound calling', description: 'Route inbound calls to any team member or AI agent.' },
  { icon: PhoneForwarded, title: 'Call routing', description: 'Set up IVRs, ring groups, and time-based routing.' },
  { icon: Hash, title: 'Number management', description: 'Provision, configure, and release numbers instantly.' },
  { icon: Signal, title: 'Carrier-grade reliability', description: '99.99% uptime SLA with redundant carrier infrastructure.' },
]

const faqs = [
  { q: 'How quickly can I get a virtual number?', a: 'Most numbers are provisioned instantly. Some international numbers may require identity verification and can take up to 24 hours.' },
  { q: 'Can I port my existing numbers?', a: 'Yes, we support number porting from most major carriers. The porting process typically takes 5–10 business days depending on the carrier.' },
  { q: 'Are there per-minute charges?', a: 'Calling minutes are included in your plan. Usage beyond your plan\'s included minutes is billed at competitive per-minute rates.' },
  { q: 'Can I use numbers for SMS?', a: 'Many numbers support both voice and SMS. SMS-capable numbers are marked in our search results.' },
]

function NumberSearchDemo() {
  const [selectedCountry, setSelectedCountry] = React.useState('US')
  const [numberType, setNumberType] = React.useState<string>('local')
  const [results, setResults] = React.useState(searchableNumbers)
  const [searched, setSearched] = React.useState(false)

  function handleSearch() {
    const filtered = searchableNumbers.filter((n) => {
      if (n.countryCode !== selectedCountry) return false
      if (numberType && n.type !== numberType) return false
      return true
    })
    setResults(filtered.length > 0 ? filtered : searchableNumbers.slice(0, 3))
    setSearched(true)
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <h3 className="font-display text-xl font-bold text-foreground">Search available numbers</h3>
      <p className="mt-2 text-sm text-muted-foreground">Find your ideal business number. These are demo results — connect a telephony provider for live availability.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Country</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
          >
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Type</label>
          <select
            value={numberType}
            onChange={(e) => setNumberType(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
          >
            <option value="local">Local</option>
            <option value="toll-free">Toll-Free</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <Button onClick={handleSearch} className="w-full">
            <Search className="size-4" />
            Search numbers
          </Button>
        </div>
      </div>

      {searched && (
        <div className="mt-6 flex flex-col gap-3">
          {results.map((num) => (
            <div
              key={num.id}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Hash className="size-5" />
                </span>
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">{num.formatted}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {num.country} · {num.region}
                    <Badge variant="outline" className="ml-1 text-[10px]">{num.type}</Badge>
                    {num.capabilities.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">${num.monthlyPrice}/mo</span>
                <Button size="sm" variant="outline">Get number</Button>
              </div>
            </div>
          ))}
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Demo data — connect a telephony provider for live number availability.
          </p>
        </div>
      )}
    </div>
  )
}

export default function VirtualNumbersPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Reveal>
              <Eyebrow>Virtual Numbers</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Global virtual numbers for modern business
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Get business phone numbers for your teams and customers across supported countries without traditional telecom complexity.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/register" />}>
                  Start free trial
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm" render={<Link href="/pricing" />}>
                  View pricing
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Everything you need for business calling"
            description="Provision, manage, and route calls across your global team."
          />
          <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Number search */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <NumberSearchDemo />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title="Frequently asked questions" />
          <div className="mt-10 flex flex-col gap-4">
            {faqs.map((faq) => (
              <Reveal key={faq.q}>
                <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
                  <h3 className="flex items-start gap-3 font-display text-base font-bold text-foreground">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-info" />
                    {faq.q}
                  </h3>
                  <p className="mt-3 pl-8 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
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
              title="Get your business numbers today"
              description="Start your free trial and provision numbers in minutes. No telecom contracts required."
            />
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/register" />}>
                Start free trial
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm" render={<Link href="/contact" />}>
                Talk to sales
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
