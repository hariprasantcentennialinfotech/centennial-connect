'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  HelpCircle,
  List,
  Mic,
  MicOff,
  Pause,
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneOutgoing,
  Play,
  Settings,
  Users,
  Zap,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion'
import { Counter } from '@/components/motion'
import { SectionHeading, Eyebrow } from '@/components/marketing/primitives'
import { campaigns, dialerContacts } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const features = [
  { icon: List, title: 'Contact lists', description: 'Import and manage contact lists with tagging and segmentation.' },
  { icon: Zap, title: 'Automated dialing', description: 'Automatically dial through lists — preview, progressive, or predictive modes.' },
  { icon: Users, title: 'Call queues', description: 'Intelligent queue management with priority routing and overflow handling.' },
  { icon: BarChart3, title: 'Call status tracking', description: 'Real-time visibility into call outcomes, dispositions, and follow-ups.' },
  { icon: Timer, title: 'Call history', description: 'Complete call history with recordings, notes, and activity timeline.' },
  { icon: TrendingUp, title: 'Agent productivity', description: 'Analytics on connect rates, talk time, and conversion metrics per agent.' },
]

const faqs = [
  { q: 'What dialing modes are available?', a: 'We offer three modes: Preview (agent sees contact info before dialing), Progressive (auto-dials when agent is available), and Predictive (dials ahead of agent availability for maximum efficiency).' },
  { q: 'Can I use my existing phone numbers?', a: 'Yes. You can use any virtual number from your Centennial Connect account as the caller ID for power dialer campaigns.' },
  { q: 'How are contacts managed?', a: 'Import contacts via CSV, connect your CRM, or add them manually. Contacts are shared across all products in your account.' },
  { q: 'Is there a limit on campaigns?', a: 'There is no limit on the number of campaigns. Your plan determines the number of concurrent agent seats and dialing minutes available.' },
]

function DialerPreview() {
  const campaign = campaigns[0]
  const currentContact = dialerContacts[2]

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]">
      {/* Campaign header */}
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{campaign.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-success border-success/30 bg-success/10">Active</Badge>
              <span>{campaign.contactCount} contacts</span>
              <span>{campaign.callsCompleted} completed</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Pause className="size-3.5" /> Pause</Button>
            <Button variant="outline" size="sm"><Settings className="size-3.5" /></Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_280px]">
        {/* Contact list */}
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Queue</h4>
          <div className="mt-3 flex flex-col gap-2">
            {dialerContacts.slice(0, 5).map((c, i) => (
              <div
                key={c.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 transition-colors',
                  i === 2 ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-secondary/50',
                )}
              >
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    c.callState === 'connected' ? 'bg-success' :
                    c.callState === 'in-progress' ? 'bg-info animate-pulse' :
                    c.callState === 'no-answer' ? 'bg-destructive' : 'bg-muted-foreground/30',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current call */}
        <div className="border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-info/10 text-info">
              <PhoneCall className="size-7" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-foreground">{currentContact.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{currentContact.company}</p>
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">{currentContact.phone}</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className="text-info border-info/30 bg-info/10">
                <span className="mr-1 size-1.5 rounded-full bg-info animate-pulse" />
                In Progress
              </Badge>
              <span className="font-mono text-sm text-foreground">2:34</span>
            </div>

            {/* Call controls */}
            <div className="mt-6 flex items-center gap-3">
              <button className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80" title="Mute">
                <MicOff className="size-5" />
              </button>
              <button className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80" title="Hold">
                <Pause className="size-5" />
              </button>
              <button className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80" title="Transfer">
                <PhoneOutgoing className="size-5" />
              </button>
              <button className="flex size-12 items-center justify-center rounded-full bg-destructive text-white transition-colors hover:bg-destructive/90" title="End Call">
                <PhoneOff className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Call info */}
        <div className="p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Info</h4>
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{currentContact.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="secondary" className="mt-0.5">{currentContact.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {currentContact.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <div className="mt-1 rounded-lg border border-input bg-secondary/30 p-2 text-xs text-muted-foreground">
                {currentContact.notes || 'No notes yet.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PowerDialerPage() {
  const campaign = campaigns[0]
  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Reveal>
              <Eyebrow>Power Dialer</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Help your sales team reach more prospects
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Intelligent outbound calling workflows that connect reps to 3x more live conversations every day.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/register" />}>
                  Start free trial
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-11 px-6 text-sm" render={<Link href="/contact" />}>
                  Book a demo
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pt-16">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Calls completed', value: campaign.callsCompleted },
                { label: 'Connected calls', value: campaign.connected },
                { label: 'Conversion rate', value: campaign.conversionRate, suffix: '%' },
                { label: 'Active campaigns', value: campaigns.filter((c) => c.status === 'active').length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/70 bg-card p-5 text-center shadow-[var(--shadow-card)]">
                  <p className="font-display text-2xl font-extrabold text-foreground">
                    <Counter value={s.value} suffix={s.suffix ?? ''} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Everything for outbound calling"
            description="Automated dialing, queue management, and real-time analytics."
          />
          <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
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

      {/* Dialer preview */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            title="The dialer your reps will love"
            description="Everything they need — contact list, call controls, and notes — in one view."
          />
          <Reveal className="mt-10">
            <DialerPreview />
          </Reveal>
        </div>
      </section>

      {/* Campaign management preview */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h3 className="font-display text-lg font-bold text-foreground">Campaign Management</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create, manage, and track outbound calling campaigns.</p>
              <div className="mt-6 flex flex-col gap-3">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        'flex size-10 items-center justify-center rounded-lg',
                        c.status === 'active' ? 'bg-success/10 text-success' : 'bg-amber/10 text-amber',
                      )}>
                        <PhoneOutgoing className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.name}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px]',
                              c.status === 'active' ? 'text-success border-success/30 bg-success/10' : 'text-amber border-amber/30 bg-amber/10',
                            )}
                          >
                            {c.status}
                          </Badge>
                          <span>{c.contactCount} contacts</span>
                          <span>{c.callsCompleted}/{c.contactCount} calls</span>
                          <span>{c.conversionRate}% conversion</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-success transition-all"
                          style={{ width: `${(c.callsCompleted / c.contactCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-success" />
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
              title="Ready to dial smarter?"
              description="Start your free trial and launch your first campaign in minutes."
            />
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      </section>
    </>
  )
}
