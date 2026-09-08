'use client'

import * as React from 'react'
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PhoneCall,
  Clock,
  Bot,
  Zap,
  Filter,
  RefreshCw,
  PhoneIncoming,
  PhoneOutgoing,
  CheckCircle2,
  PieChart,
  Layers,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, LineChart, DonutChart } from '@/components/charts/charts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  callVolumeSeries as initialCallVolume,
  successRateSeries as initialSuccessRate,
  durationSeries as initialDuration,
  aiVsHumanSeries as initialAiVsHuman,
  usageByProduct,
} from '@/lib/mock-data'
import { getAnalyticsAction } from '@/app/actions/analytics'
import type { TimeSeriesPoint } from '@/lib/types'

type DateRange = 'today' | '7d' | '30d' | '90d'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange>('7d')
  const [isLoading, setIsLoading] = React.useState(false)
  const [lastSynced, setLastSynced] = React.useState('Just now')

  // Analytics state
  const [callVolume, setCallVolume] = React.useState<TimeSeriesPoint[]>(initialCallVolume)
  const [aiVsHuman, setAiVsHuman] = React.useState<TimeSeriesPoint[]>(initialAiVsHuman)
  const [successRate, setSuccessRate] = React.useState<TimeSeriesPoint[]>(initialSuccessRate)
  const [duration, setDuration] = React.useState<TimeSeriesPoint[]>(initialDuration)

  const [kpis, setKpis] = React.useState({
    connectRate: '68.4%',
    connectRateDelta: 4.2,
    avgDuration: '3m 42s',
    avgDurationDelta: -1.8,
    aiContainment: '87.3%',
    aiContainmentDelta: 12.5,
    dialerVelocity: '48 calls/hr',
    dialerVelocityDelta: 18.0,
    totalCalls: 3482,
    completedCalls: 2189,
    aiCalls: 964,
  })

  // Fetch analytics from Server Action
  const fetchAnalytics = React.useCallback(async (range: DateRange) => {
    setIsLoading(true)
    try {
      const res = await getAnalyticsAction(range)
      if (res.success && res.analytics) {
        setCallVolume(res.analytics.callVolume)
        setAiVsHuman(res.analytics.aiVsHuman)
        setSuccessRate(res.analytics.successRate)
        setDuration(res.analytics.duration)
        if (res.analytics.kpis) {
          setKpis(res.analytics.kpis)
        }
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch {
      // Retain previous state gracefully
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAnalytics(dateRange)
  }, [dateRange, fetchAnalytics])

  // Real CSV Export
  const handleExportCsv = () => {
    const lines: string[] = []

    lines.push('--- CENTENNIAL CONNECT ANALYTICS REPORT ---')
    lines.push(`Report Range,${dateRange}`)
    lines.push(`Export Timestamp,${new Date().toISOString()}`)
    lines.push(`Connect Rate,${kpis.connectRate}`)
    lines.push(`Avg Call Duration,${kpis.avgDuration}`)
    lines.push(`AI Containment Rate,${kpis.aiContainment}`)
    lines.push(`Dialer Velocity,${kpis.dialerVelocity}`)
    lines.push('')

    lines.push('--- CALL VOLUME BY TIMEFRAME ---')
    lines.push('Period,Total Calls,Connected Calls')
    for (const p of callVolume) {
      lines.push(`"${p.label}",${p.value},${p.secondary ?? 0}`)
    }
    lines.push('')

    lines.push('--- AI VS HUMAN REPS ---')
    lines.push('Period,Live Agents,AI Voice')
    for (const p of aiVsHuman) {
      lines.push(`"${p.label}",${p.value},${p.secondary ?? 0}`)
    }
    lines.push('')

    lines.push('--- SUCCESS RATE TREND ---')
    lines.push('Period,Connect Rate (%)')
    for (const p of successRate) {
      lines.push(`"${p.label}",${p.value}%`)
    }
    lines.push('')

    lines.push('--- AVERAGE DURATION TREND ---')
    lines.push('Period,Average Duration (seconds)')
    for (const p of duration) {
      lines.push(`"${p.label}",${p.value}s`)
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `centennial-connect-analytics-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Analytics & Reporting"
        subheading="Dynamic telemetry aggregating call conversion, AI voice resolution, and telephony utilization"
        badge="Live Telemetry"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range selector */}
          <div className="inline-flex rounded-xl border border-border/80 bg-muted/40 p-1 text-xs">
            {(['today', '7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                  dateRange === r
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(dateRange)}
            disabled={isLoading}
            className="gap-1.5 rounded-xl border-border/80 text-xs"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1.5 rounded-xl border-border/80 text-xs"
          >
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </PageHeader>

      {/* Sync indicator */}
      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>Range: <strong className="text-foreground uppercase">{dateRange}</strong></span>
        <span>Last computed: {lastSynced}</span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Connect Rate"
          value={kpis.connectRate}
          delta={kpis.connectRateDelta}
          icon={<TrendingUp className="size-5" />}
          sparklineData={successRate.map((p) => p.value)}
          sparklineColor="var(--chart-2)"
        />
        <StatCard
          label="Average Call Duration"
          value={kpis.avgDuration}
          delta={kpis.avgDurationDelta}
          trend="down"
          icon={<Clock className="size-5" />}
          sparklineData={duration.map((p) => p.value)}
        />
        <StatCard
          label="AI Containment Rate"
          value={kpis.aiContainment}
          delta={kpis.aiContainmentDelta}
          icon={<Bot className="size-5" />}
          sparklineData={[72, 75, 78, 82, 84, 86, 87]}
          sparklineColor="var(--brand-accent)"
        />
        <StatCard
          label="Dialer Velocity"
          value={kpis.dialerVelocity}
          delta={kpis.dialerVelocityDelta}
          icon={<Zap className="size-5" />}
          sparklineData={[32, 38, 41, 40, 44, 46, 48]}
        />
      </div>

      {/* Chart Rows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calls Volume Over Time */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Call Reach & Velocity</CardTitle>
              <CardDescription className="text-xs">
                Total dials vs answered connections for {dateRange === 'today' ? 'today' : `the last ${dateRange}`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono uppercase">{dateRange}</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <BarChart
              data={callVolume}
              height={230}
              showSecondary
              primaryLabel="Total Calls"
              secondaryLabel="Connected"
            />
          </CardContent>
        </Card>

        {/* AI vs Human Handling */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">AI vs Live Agent Resolution</CardTitle>
              <CardDescription className="text-xs">
                Autonomous voice interactions handled by Aria vs human sales team
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs text-brand-primary">AI + Softphone</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <BarChart
              data={aiVsHuman}
              height={230}
              showSecondary
              primaryLabel="Live Reps"
              secondaryLabel="AI Agent"
            />
          </CardContent>
        </Card>

        {/* Success Rate Line Chart */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Connection Rate Progression</CardTitle>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Peak {Math.max(...successRate.map((p) => p.value))}%
              </span>
            </div>
            <CardDescription className="text-xs">Percentage of dials successfully answered</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LineChart data={successRate} height={220} suffix="%" />
          </CardContent>
        </Card>

        {/* Average Duration Line Chart */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold">Average Duration per Connection</CardTitle>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                Avg {kpis.avgDuration}
              </span>
            </div>
            <CardDescription className="text-xs">Qualified conversation talk time (seconds)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LineChart data={duration} height={220} suffix="s" />
          </CardContent>
        </Card>
      </div>

      {/* Telephony Resource Allocation */}
      <Card className="border-border/80 bg-card/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-brand-primary" />
              Telephony Resource Utilization
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current usage quota across virtual numbers, AI synthesis minutes, and dialer lines
            </p>
          </div>
          <Badge variant="outline" className="text-xs">Tenant Scope: Active</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {usageByProduct.map((product) => {
            const percent = Math.min(100, Math.round((product.value / 100) * 100))
            return (
              <div key={product.label} className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground">{product.label}</span>
                  <span className="text-muted-foreground">{product.value}% of limit</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-primary transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Automatic tier scaling enabled
                </p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
