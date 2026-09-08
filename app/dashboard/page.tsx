'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  PhoneCall,
  PhoneForwarded,
  Bot,
  Users,
  Hash,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  Database,
  ExternalLink,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import { PageHeader } from '@/components/dashboard/page-header'
import { BarChart, LineChart, DonutChart } from '@/components/charts/charts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  dashboardStats,
  callVolumeSeries,
  successRateSeries,
  durationSeries,
  usageByProduct,
  activityLog,
} from '@/lib/mock-data'

export default function DashboardPage() {
  const [selectedProductFilter, setSelectedProductFilter] = React.useState('all')

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-primary/15 via-brand-accent/10 to-transparent p-6 sm:p-8 border border-brand-primary/20 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              <span>MongoDB Cloud Synced & Telephony Online</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, Alex!
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Your communications pipeline is operating at 94.2% efficiency today. 
              Aria has resolved 48 inquiries and the Power Dialer has 72 calls queued.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="gap-2 rounded-xl border-border/80 bg-background/80 hover:bg-muted"
            >
              <Link href="/dashboard/virtual-numbers">
                <Plus className="size-4" />
                Add Number
              </Link>
            </Button>
            <Button
              asChild
              className="gap-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20"
            >
              <Link href="/dashboard/power-dialer">
                <Play className="size-4" />
                Start Calling Session
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-primary/10 blur-3xl" />
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Calls"
          value={dashboardStats[0].value}
          delta={dashboardStats[0].delta}
          icon={<PhoneCall className="size-5" />}
          sparklineData={[380, 420, 510, 480, 604, 566, 620]}
        />
        <StatCard
          label="Connected"
          value={dashboardStats[1].value}
          delta={dashboardStats[1].delta}
          icon={<CheckCircle2 className="size-5" />}
          sparklineData={[240, 290, 340, 320, 402, 380, 410]}
          sparklineColor="var(--chart-2)"
        />
        <StatCard
          label="AI Calls"
          value={dashboardStats[2].value}
          delta={dashboardStats[2].delta}
          icon={<Bot className="size-5" />}
          sparklineData={[120, 150, 180, 210, 250, 280, 310]}
          sparklineColor="var(--brand-accent)"
        />
        <StatCard
          label="Outbound"
          value={dashboardStats[3].value}
          delta={dashboardStats[3].delta}
          icon={<PhoneForwarded className="size-5" />}
          sparklineData={[260, 290, 310, 330, 360, 350, 390]}
        />
        <StatCard
          label="Minutes"
          value="12.0k"
          delta={dashboardStats[4].delta}
          icon={<Clock className="size-5" />}
          sparklineData={[1400, 1600, 1900, 1800, 2200, 2100, 2400]}
        />
        <StatCard
          label="Active Lines"
          value={dashboardStats[5].value}
          icon={<Hash className="size-5" />}
          description="4 active / 25 limit"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Call Volume Bar Chart */}
        <Card className="lg:col-span-2 overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Call Volume & Reach</CardTitle>
              <CardDescription className="text-xs">
                Comparison of daily dialed vs connected calls
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-brand-primary">
              Last 7 Days
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <BarChart
              data={callVolumeSeries}
              height={240}
              showSecondary
              primaryLabel="Total Dialed"
              secondaryLabel="Connected"
            />
          </CardContent>
        </Card>

        {/* Product Usage Donut */}
        <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Product Distribution</CardTitle>
            <CardDescription className="text-xs">Traffic handled across services</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <DonutChart data={usageByProduct} size={190} />
          </CardContent>
        </Card>
      </div>

      {/* Product Highlight Quick Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Virtual Numbers Card */}
        <div className="group rounded-2xl border border-border/80 bg-card/60 p-5 transition-all hover:border-brand-primary/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
              <Hash className="size-5" />
            </div>
            <Badge variant="secondary" className="text-[11px] font-semibold">
              4 Active
            </Badge>
          </div>
          <h3 className="mt-4 font-display text-base font-bold">Virtual Numbers</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Local & toll-free numbers in 50+ countries with instant routing and call forwarding.
          </p>
          <Link
            href="/dashboard/virtual-numbers"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary group-hover:underline"
          >
            Manage numbers <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* AI Voice Agent Card */}
        <div className="group rounded-2xl border border-brand-primary/30 bg-gradient-to-b from-brand-primary/10 via-card/60 to-card/60 p-5 transition-all hover:border-brand-primary/50 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
              <Bot className="size-5" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live & Answering
            </span>
          </div>
          <h3 className="mt-4 font-display text-base font-bold">Aria — AI Voice Agent</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Resolving inbound inquiries, qualifying opportunities, and booking meetings 24/7.
          </p>
          <Link
            href="/dashboard/voice-agent"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary group-hover:underline"
          >
            Configure AI agent <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Power Dialer Card */}
        <div className="group rounded-2xl border border-border/80 bg-card/60 p-5 transition-all hover:border-brand-primary/40 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20">
              <PhoneForwarded className="size-5" />
            </div>
            <Badge variant="secondary" className="text-[11px] font-semibold">
              Campaign Active
            </Badge>
          </div>
          <h3 className="mt-4 font-display text-base font-bold">Power Dialer</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Triple your sales team reach with automated dialing, local presence, and CRM logging.
          </p>
          <Link
            href="/dashboard/power-dialer"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:underline"
          >
            Open dialer queue <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Table */}
      <Card className="overflow-hidden border-border/80 bg-card/60 backdrop-blur-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Live Call Activity</CardTitle>
            <CardDescription className="text-xs">
              Recent communications processed across all numbers
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 text-xs">
            <Link href="/dashboard/calls">
              View Full History <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activityLog.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-foreground">
                      {log.contact}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          log.type === 'ai'
                            ? 'bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20'
                            : log.type === 'inbound'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        }`}
                      >
                        {log.type === 'ai' && <Bot className="size-3" />}
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          log.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : log.status === 'missed'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{log.duration}</td>
                    <td className="py-3.5 px-5 text-right text-muted-foreground">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
