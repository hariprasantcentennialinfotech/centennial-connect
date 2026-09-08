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
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, LineChart, DonutChart } from '@/components/charts/charts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  callVolumeSeries,
  successRateSeries,
  durationSeries,
  aiVsHumanSeries,
  usageByProduct,
} from '@/lib/mock-data'

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState('7d')

  return (
    <div className="space-y-8">
      <PageHeader
        heading="Analytics & Reporting"
        subheading="Deep metrics into call conversion, AI agent performance, and telephony utilization"
        badge="Live Telemetry"
      >
        <div className="flex items-center gap-2">
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

          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-border/80 text-xs">
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Connect Rate"
          value="68.4%"
          delta={4.2}
          icon={<TrendingUp className="size-5" />}
          sparklineData={[61, 63, 65, 64, 68, 67, 71]}
          sparklineColor="var(--chart-2)"
        />
        <StatCard
          label="Average Call Duration"
          value="3m 42s"
          delta={-1.8}
          trend="down"
          icon={<Clock className="size-5" />}
          sparklineData={[240, 230, 225, 218, 222, 215, 222]}
        />
        <StatCard
          label="AI Containment Rate"
          value="87.3%"
          delta={12.5}
          icon={<Bot className="size-5" />}
          sparklineData={[72, 75, 78, 82, 84, 86, 87]}
          sparklineColor="var(--brand-accent)"
        />
        <StatCard
          label="Dialer Velocity"
          value="48 calls/hr"
          delta={18.0}
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
              <CardTitle className="text-base font-bold">Call Reach by Day</CardTitle>
              <CardDescription className="text-xs">Outbound vs connected calls</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">Daily Trend</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <BarChart
              data={callVolumeSeries}
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
              <CardTitle className="text-base font-bold">AI vs Human Agent Distribution</CardTitle>
              <CardDescription className="text-xs">
                Inquiries resolved autonomously by Aria vs live agents
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs text-brand-primary">AI + Human</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <BarChart
              data={aiVsHumanSeries}
              height={230}
              showSecondary
              primaryLabel="Live Reps"
              secondaryLabel="AI Voice Agent"
            />
          </CardContent>
        </Card>

        {/* Success Rate Line Chart */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Call Connection Rate Trend</CardTitle>
            <CardDescription className="text-xs">Percentage of answered calls over the cycle</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LineChart data={successRateSeries} height={220} suffix="%" />
          </CardContent>
        </Card>

        {/* Average Duration Line Chart */}
        <Card className="border-border/80 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Average Duration per Connection</CardTitle>
            <CardDescription className="text-xs">Length of qualified customer interactions (seconds)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LineChart data={durationSeries} height={220} suffix="s" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
