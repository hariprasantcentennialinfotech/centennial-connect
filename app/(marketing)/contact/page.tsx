'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  Send,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Reveal } from '@/components/motion'
import { SectionHeading, Eyebrow } from '@/components/marketing/primitives'

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'hello@centennialinfotech.com', href: 'mailto:hello@centennialinfotech.com' },
  { icon: Phone, label: 'Phone', value: '+1 (800) 555-0199', href: 'tel:+18005550199' },
  { icon: MapPin, label: 'Office', value: 'Centennial InfoTech HQ', href: 'https://centennialinfotech.com/' },
  { icon: Clock, label: 'Hours', value: 'Mon – Fri, 9 AM – 6 PM IST', href: null },
]

const products = ['Virtual Numbers', 'AI Voice Agent', 'Power Dialer', 'Full Platform', 'Not sure yet']

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()

    const newErrors: Record<string, string> = {}
    if (name.length < 2) newErrors.name = 'Please enter your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email.'
    if (message.length < 10) newErrors.message = 'Message must be at least 10 characters.'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSubmitted(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              eyebrow="Contact"
              title="Let's start a conversation"
              description="Have questions about Centennial Connect? Want a personalized demo? Our team is ready to help."
            />
          </Reveal>
        </div>
      </section>

      {/* Form + Info */}
      <section className="px-4 pt-14 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            {/* Form */}
            <Reveal>
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                {submitted ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                      <Check className="size-8" />
                    </span>
                    <h3 className="mt-6 font-display text-2xl font-bold text-foreground">
                      Message sent!
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                      Thank you for reaching out. Our team will get back to you within one business day.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Send us a message
                    </h2>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="contact-name">Full name *</Label>
                        <Input id="contact-name" name="name" placeholder="Alex Morgan" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="contact-email">Work email *</Label>
                        <Input id="contact-email" name="email" type="email" placeholder="alex@company.com" />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="contact-company">Company</Label>
                        <Input id="contact-company" name="company" placeholder="Acme Inc." />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="contact-phone">Phone</Label>
                        <Input id="contact-phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="contact-product">Product interest</Label>
                      <select
                        id="contact-product"
                        name="product"
                        className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a product…</option>
                        {products.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="contact-message">Message *</Label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        rows={5}
                        placeholder="Tell us about your team, your current calling setup, and what you're looking for…"
                      />
                      {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                    </div>

                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                      <Send className="size-4" />
                      Send message
                    </Button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* Contact info */}
            <Reveal delay={100}>
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
                  <h3 className="font-display text-lg font-bold text-foreground">Get in touch</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Reach us directly through any of these channels, or fill out the form and we'll get back to you within one business day.
                  </p>
                  <div className="mt-6 flex flex-col gap-4">
                    {contactInfo.map((c) => (
                      <div key={c.label} className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <c.icon className="size-5" />
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
                          {c.href ? (
                            <a
                              href={c.href}
                              className="text-sm font-medium text-foreground transition-colors hover:text-brand-bright"
                              target={c.href.startsWith('http') ? '_blank' : undefined}
                              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                              {c.value}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-foreground">{c.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-primary p-6 text-primary-foreground shadow-[var(--shadow-card)] sm:p-8">
                  <h3 className="font-display text-lg font-bold">Book a demo</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/80">
                    See Centennial Connect in action. Schedule a personalized walkthrough with our product team.
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="mt-5"
                    render={<Link href="/register" />}
                  >
                    Schedule demo
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
