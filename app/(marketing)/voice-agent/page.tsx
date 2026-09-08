'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Check,
  Globe,
  HelpCircle,
  Languages,
  Mic,
  Phone,
  PhoneForwarded,
  Play,
  Settings,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion'
import { Counter } from '@/components/motion'
import { SectionHeading, Eyebrow } from '@/components/marketing/primitives'
import { voiceAgents, sampleConversation } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const features = [
  { icon: Sparkles, title: 'AI-powered conversations', description: 'Natural, human-like voice interactions powered by advanced language models.' },
  { icon: Phone, title: 'Automated outbound calls', description: 'Schedule outbound AI calls for follow-ups, reminders, and surveys.' },
  { icon: PhoneForwarded, title: 'Inbound call handling', description: 'Let AI answer, qualify, and route inbound calls 24/7.' },
  { icon: Settings, title: 'Call workflows', description: 'Design multi-step call flows with branching logic and transfers.' },
  { icon: Globe, title: 'Multilingual support', description: 'AI agents that speak 12+ languages fluently.' },
  { icon: Mic, title: 'Custom voices', description: 'Choose from multiple voice profiles or create a custom voice for your brand.' },
]

const voices = ['Aria (Warm, Female)', 'Nova (Neutral, Female)', 'Atlas (Deep, Male)', 'Rowan (Calm, Male)', 'Sage (Bright, Neutral)']

const faqs = [
  { q: 'How realistic are the AI voice conversations?', a: 'Our AI agents use the latest speech synthesis technology to deliver natural, human-like conversations. Most callers cannot distinguish between AI and human agents.' },
  { q: 'Can the AI agent transfer to a human?', a: 'Yes. You can configure transfer rules so the AI hands off to a human agent when specific conditions are met — such as escalation keywords, sentiment detection, or caller requests.' },
  { q: 'What happens if the AI doesn\'t understand?', a: 'The agent uses clarification strategies and can gracefully transfer to a human if it cannot resolve the query. All conversations are logged for review.' },
  { q: 'How do I train the AI agent?', a: 'You provide a system prompt with your business context, objectives, and guidelines. No coding or ML expertise required. The agent learns from context, not training data.' },
]

function AgentDashboardPreview() {
  const agent = voiceAgents[0]
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-foreground">Agent Dashboard</h3>
        <Badge variant="outline" className="text-success border-success/30 bg-success/10">
          <span className="mr-1.5 size-1.5 rounded-full bg-success" />
          Active
        </Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agent Name</p>
          <p className="mt-1 font-display text-sm font-bold text-foreground">{agent.name}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Voice</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{agent.voice}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Language</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{agent.language}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Phone Number</p>
          <p className="mt-1 font-mono text-sm font-semibold text-foreground">{agent.phoneNumber}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Call Volume</p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">
            <Counter value={agent.callVolume} />
          </p>
        </div>
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Success Rate</p>
          <p className="mt-1 font-display text-lg font-bold text-success">
            <Counter value={agent.successRate} suffix="%" />
          </p>
        </div>
      </div>

      {/* Conversation preview */}
      <div className="mt-6 rounded-xl border border-border/50 bg-secondary/30 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sample conversation</h4>
        <div className="mt-4 flex flex-col gap-3">
          {sampleConversation.map((turn, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3',
                turn.speaker === 'agent' ? '' : 'flex-row-reverse',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                  turn.speaker === 'agent'
                    ? 'bg-violet/10 text-violet'
                    : 'bg-info/10 text-info',
                )}
              >
                {turn.speaker === 'agent' ? <Bot className="size-4" /> : 'C'}
              </span>
              <div
                className={cn(
                  'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                  turn.speaker === 'agent'
                    ? 'bg-violet/5 text-foreground'
                    : 'bg-info/5 text-foreground',
                )}
              >
                {turn.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function VoiceAgentPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Reveal>
              <Eyebrow>AI Voice Agent</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Let AI handle the conversations that keep your business moving
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Automate customer conversations with intelligent AI voice agents designed for inbound and outbound workflows.
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
                { label: 'Calls handled', value: 1284, suffix: '' },
                { label: 'Success rate', value: 87, suffix: '%' },
                { label: 'Avg duration', value: 2, suffix: ':48' },
                { label: 'Languages', value: 12, suffix: '+' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border/70 bg-card p-5 text-center shadow-[var(--shadow-card)]">
                  <p className="font-display text-2xl font-extrabold text-foreground">
                    <Counter value={s.value} suffix={s.suffix} />
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
            title="Everything you need for AI calling"
            description="Configure once, scale infinitely."
          />
          <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <div className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet/10 text-violet">
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

      {/* Agent dashboard preview */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <AgentDashboardPreview />
          </Reveal>
        </div>
      </section>

      {/* Configuration preview */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">Agent Configuration</h3>
                <Button variant="outline" size="sm">
                  <Play className="size-3.5" />
                  Test Agent
                </Button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Agent name', value: 'Aria — Inbound Concierge' },
                  { label: 'Voice', value: 'Aria (Warm, Female)' },
                  { label: 'Language', value: 'English (US)' },
                  { label: 'Working hours', value: 'Mon–Fri, 8:00 AM – 6:00 PM PT' },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">{field.label}</label>
                    <div className="h-9 rounded-lg border border-input bg-secondary/30 px-3 flex items-center text-sm text-foreground">
                      {field.value}
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Greeting</label>
                  <div className="min-h-[4rem] rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm text-foreground leading-relaxed">
                    {voiceAgents[0].greeting}
                  </div>
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">System instructions</label>
                  <div className="min-h-[4rem] rounded-lg border border-input bg-secondary/30 px-3 py-2 text-sm text-muted-foreground leading-relaxed">
                    {voiceAgents[0].instructions}
                  </div>
                </div>
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
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-violet" />
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
              title="Put AI to work on your phones"
              description="Start your free trial and deploy your first AI voice agent in minutes."
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
