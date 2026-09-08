import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Minus, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion'
import { SectionHeading, Eyebrow } from '@/components/marketing/primitives'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for Centennial Connect. Start free and scale as you grow.',
}

const plans = [
  {
    name: 'Starter',
    price: 29,
    description: 'For small teams getting started with business calling.',
    features: [
      '2 virtual numbers',
      '500 calling minutes',
      '1 AI voice agent',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start free trial',
    href: '/register',
    popular: false,
  },
  {
    name: 'Growth',
    price: 79,
    description: 'For growing teams that need power dialing and AI agents.',
    features: [
      '10 virtual numbers',
      '5,000 calling minutes',
      '3 AI voice agents',
      'Power Dialer included',
      'Advanced analytics',
      'Priority support',
      'CRM integrations',
    ],
    cta: 'Start free trial',
    href: '/register',
    popular: true,
  },
  {
    name: 'Scale',
    price: 199,
    description: 'For high-volume teams with advanced needs.',
    features: [
      '25 virtual numbers',
      '20,000 calling minutes',
      '10 AI voice agents',
      'Power Dialer with predictive mode',
      'Custom analytics & reports',
      'Dedicated account manager',
      'API access',
      'SSO / SAML',
    ],
    cta: 'Start free trial',
    href: '/register',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'For organizations that need custom solutions at scale.',
    features: [
      'Unlimited virtual numbers',
      'Unlimited calling minutes',
      'Unlimited AI voice agents',
      'All dialing modes',
      'Custom integrations',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Custom onboarding',
      'Volume discounts',
    ],
    cta: 'Contact sales',
    href: '/contact',
    popular: false,
  },
]

const comparisonFeatures = [
  { category: 'Numbers', features: [
    { name: 'Virtual numbers', starter: '2', growth: '10', scale: '25', enterprise: 'Unlimited' },
    { name: 'Countries', starter: '5', growth: '30+', scale: '70+', enterprise: '70+' },
    { name: 'Toll-free numbers', starter: false, growth: true, scale: true, enterprise: true },
    { name: 'Number porting', starter: false, growth: true, scale: true, enterprise: true },
  ]},
  { category: 'Calling', features: [
    { name: 'Calling minutes', starter: '500', growth: '5,000', scale: '20,000', enterprise: 'Unlimited' },
    { name: 'Call recording', starter: true, growth: true, scale: true, enterprise: true },
    { name: 'Call routing', starter: 'Basic', growth: 'Advanced', scale: 'Advanced', enterprise: 'Custom' },
    { name: 'Power Dialer', starter: false, growth: true, scale: true, enterprise: true },
    { name: 'Predictive dialing', starter: false, growth: false, scale: true, enterprise: true },
  ]},
  { category: 'AI', features: [
    { name: 'AI voice agents', starter: '1', growth: '3', scale: '10', enterprise: 'Unlimited' },
    { name: 'AI minutes', starter: '100', growth: '1,000', scale: '5,000', enterprise: 'Unlimited' },
    { name: 'Custom AI voices', starter: false, growth: false, scale: true, enterprise: true },
    { name: 'AI conversation analytics', starter: false, growth: true, scale: true, enterprise: true },
  ]},
  { category: 'Platform', features: [
    { name: 'Team members', starter: '3', growth: '12', scale: '50', enterprise: 'Unlimited' },
    { name: 'Analytics', starter: 'Basic', growth: 'Advanced', scale: 'Custom', enterprise: 'Custom' },
    { name: 'API access', starter: false, growth: false, scale: true, enterprise: true },
    { name: 'SSO / SAML', starter: false, growth: false, scale: true, enterprise: true },
    { name: 'SLA', starter: false, growth: false, scale: '99.9%', enterprise: '99.99%' },
  ]},
]

const faqs = [
  {
    q: 'Can I try Centennial Connect before committing?',
    a: 'Yes. All paid plans come with a 14-day free trial. No credit card required to start. You can upgrade, downgrade, or cancel at any time.',
  },
  {
    q: 'What happens when I exceed my plan limits?',
    a: 'We\'ll notify you as you approach your limits. You can upgrade your plan at any time or purchase additional capacity as add-ons without changing plans.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes. Annual billing saves you 20% compared to monthly pricing. Contact our sales team for custom annual agreements on Scale and Enterprise plans.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. You can upgrade or downgrade at any time. When upgrading, you get immediate access to the new features. When downgrading, the change takes effect at the end of the current billing cycle.',
  },
  {
    q: 'What telephony providers do you support?',
    a: 'Centennial Connect is provider-agnostic. We support major providers including Twilio, Telnyx, and Plivo. Enterprise customers can also bring their own carrier.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. There are no setup fees, no hidden charges, and no long-term contracts. You only pay for your plan and any additional capacity you purchase.',
  },
]

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-success" />
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/40" />
  return <span className="text-sm text-foreground">{value}</span>
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="px-4 pt-16 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <Reveal>
              <SectionHeading
                eyebrow="Pricing"
                title="Simple, transparent pricing"
                description="Start free. Scale as you grow. No hidden fees, no surprises."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pt-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={cn(
                    'relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]',
                    plan.popular
                      ? 'border-brand-bright ring-1 ring-brand-bright/30'
                      : 'border-border/70',
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-bright px-3 py-0.5 text-xs font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    {plan.price !== null ? (
                      <>
                        <span className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">/mo per seat</span>
                      </>
                    ) : (
                      <span className="font-display text-4xl font-extrabold tracking-tight text-foreground">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
                  <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Button
                      size="lg"
                      variant={plan.popular ? 'default' : 'outline'}
                      className="w-full"
                      render={<Link href={plan.href} />}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            All plans include a 14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="px-4 pt-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title="Compare plans in detail"
            description="See exactly what's included in every plan."
          />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-sm font-semibold text-foreground">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((cat) => (
                  <>
                    <tr key={cat.category}>
                      <td
                        colSpan={5}
                        className="pb-2 pt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {cat.category}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f.name} className="border-b border-border/50">
                        <td className="py-3 pr-4 text-sm text-foreground/80">{f.name}</td>
                        <td className="px-4 py-3 text-center"><FeatureValue value={f.starter} /></td>
                        <td className="px-4 py-3 text-center"><FeatureValue value={f.growth} /></td>
                        <td className="px-4 py-3 text-center"><FeatureValue value={f.scale} /></td>
                        <td className="px-4 py-3 text-center"><FeatureValue value={f.enterprise} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pt-24">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            title="Frequently asked questions"
            description="Everything you need to know about pricing and billing."
          />
          <div className="mt-12 flex flex-col gap-6">
            {faqs.map((faq) => (
              <Reveal key={faq.q}>
                <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
                  <h3 className="flex items-start gap-3 font-display text-base font-bold text-foreground">
                    <HelpCircle className="mt-0.5 size-5 shrink-0 text-brand-bright" />
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
              title="Ready to get started?"
              description="Start your 14-day free trial today. No credit card required."
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
