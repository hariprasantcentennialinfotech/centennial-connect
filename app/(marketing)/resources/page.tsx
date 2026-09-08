import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  FileText,
  Code2,
  Newspaper,
  RefreshCw,
  ExternalLink,
  Video,
  HelpCircle,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion'
import { SectionHeading } from '@/components/marketing/primitives'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Guides, documentation, API reference, and more to help you get the most out of Centennial Connect.',
}

const categories = [
  {
    icon: BookOpen,
    title: 'Guides',
    description: 'Step-by-step tutorials to get started and master every feature.',
    tone: 'text-info bg-info/10',
    items: [
      { title: 'Getting Started with Virtual Numbers', tag: 'Beginner', time: '5 min read' },
      { title: 'Setting Up Your First AI Voice Agent', tag: 'Beginner', time: '8 min read' },
      { title: 'Power Dialer Best Practices for Sales Teams', tag: 'Intermediate', time: '12 min read' },
      { title: 'Advanced Call Routing Strategies', tag: 'Advanced', time: '10 min read' },
    ],
  },
  {
    icon: FileText,
    title: 'Documentation',
    description: 'Comprehensive reference for every feature, setting, and workflow.',
    tone: 'text-violet bg-violet/10',
    items: [
      { title: 'Platform Overview', tag: 'Core', time: '' },
      { title: 'Number Management Guide', tag: 'Virtual Numbers', time: '' },
      { title: 'AI Agent Configuration Reference', tag: 'Voice Agent', time: '' },
      { title: 'Campaign Management Docs', tag: 'Power Dialer', time: '' },
    ],
  },
  {
    icon: Code2,
    title: 'API Reference',
    description: 'Build custom integrations with our RESTful API and webhooks.',
    tone: 'text-success bg-success/10',
    items: [
      { title: 'Authentication & API Keys', tag: 'Auth', time: '' },
      { title: 'Numbers API', tag: 'REST', time: '' },
      { title: 'Calls API', tag: 'REST', time: '' },
      { title: 'Webhooks Reference', tag: 'Events', time: '' },
    ],
  },
]

const quickLinks = [
  { icon: Video, title: 'Video Tutorials', description: 'Watch step-by-step product walkthroughs.', href: '#' },
  { icon: HelpCircle, title: 'Help Center', description: 'Search our knowledge base for answers.', href: '#' },
  { icon: Lightbulb, title: 'Feature Requests', description: 'Vote on and suggest new features.', href: '#' },
  { icon: Newspaper, title: 'Blog', description: 'Industry insights and product updates.', href: '#' },
]

const changelog = [
  { date: 'Sep 5, 2026', title: 'AI Voice Agent — multilingual support', description: 'Agents now support 12 languages for inbound and outbound calling.' },
  { date: 'Aug 28, 2026', title: 'Power Dialer — predictive mode', description: 'New predictive dialing mode for Scale and Enterprise plans reduces idle time by up to 40%.' },
  { date: 'Aug 15, 2026', title: 'Virtual Numbers — 15 new countries', description: 'We\'ve added local numbers in 15 additional countries across LATAM and Southeast Asia.' },
  { date: 'Aug 1, 2026', title: 'Analytics — custom date ranges', description: 'Create custom date ranges and save your favorite analytics views.' },
]

export default function ResourcesPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              eyebrow="Resources"
              title="Everything you need to succeed"
              description="Guides, documentation, API reference, and more to help your team get the most out of Centennial Connect."
            />
          </Reveal>
        </div>
      </section>

      {/* Quick links */}
      <section className="px-4 pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link, i) => (
              <Reveal key={link.title} delay={i * 60}>
                <a
                  href={link.href}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <link.icon className="size-5" />
                  </span>
                  <h3 className="font-display text-sm font-bold text-foreground">{link.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{link.description}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Resource categories */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-12">
            {categories.map((cat, ci) => (
              <Reveal key={cat.title} delay={ci * 60}>
                <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', cat.tone)}>
                      <cat.icon className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-bold text-foreground">{cat.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {cat.items.map((item) => (
                      <a
                        key={item.title}
                        href="#"
                        className="group flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-4 transition-colors hover:bg-secondary/60"
                      >
                        <div>
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-brand-bright transition-colors">
                            {item.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                              {item.tag}
                            </span>
                            {item.time && (
                              <span className="text-[11px] text-muted-foreground">{item.time}</span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Changelog */}
      <section className="px-4 pt-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Changelog"
            title="What's new"
            description="The latest features and improvements to Centennial Connect."
          />
          <div className="mt-12 flex flex-col gap-4">
            {changelog.map((entry, i) => (
              <Reveal key={entry.title} delay={i * 60}>
                <div className="flex gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-xs">
                  <div className="flex flex-col items-center">
                    <span className="size-2.5 rounded-full bg-brand-bright" />
                    {i < changelog.length - 1 && <span className="mt-1 h-full w-px bg-border" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{entry.date}</p>
                    <h4 className="mt-1 font-display text-sm font-bold text-foreground">{entry.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-1.5 pl-9">
            <RefreshCw className="size-4 text-muted-foreground" />
            <a href="#" className="text-sm font-medium text-brand-bright hover:underline">
              View full changelog
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="overflow-hidden rounded-3xl border border-border/70 bg-card p-10 text-center shadow-[var(--shadow-card)] sm:p-14">
            <SectionHeading
              title="Need help getting started?"
              description="Our team is here to help. Book a walkthrough or reach out to support."
            />
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-11 px-6 text-sm" render={<Link href="/contact" />}>
                Contact support
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm" render={<Link href="/register" />}>
                Start free trial
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
