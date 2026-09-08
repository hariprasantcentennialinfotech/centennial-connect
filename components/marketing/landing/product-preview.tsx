import {
  Phone,
  PhoneCall,
  Bot,
  TrendingUp,
  Hash,
  Activity,
} from 'lucide-react'
import { BarChart } from '@/components/charts/charts'
import { callVolumeSeries } from '@/lib/mock-data'

const miniStats = [
  { label: 'Total Calls', value: '3,482', delta: '+12.4%', icon: PhoneCall, tone: 'text-info bg-info/10' },
  { label: 'AI Calls', value: '964', delta: '+22.5%', icon: Bot, tone: 'text-violet bg-violet/10' },
  { label: 'Connected', value: '2,189', delta: '+8.1%', icon: TrendingUp, tone: 'text-success bg-success/10' },
  { label: 'Numbers', value: '4', delta: 'Active', icon: Hash, tone: 'text-amber bg-amber/15' },
]

export function ProductPreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card-hover)]">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-3">
          <span className="size-3 rounded-full bg-destructive/40" />
          <span className="size-3 rounded-full bg-amber/50" />
          <span className="size-3 rounded-full bg-success/50" />
          <div className="ml-3 flex items-center gap-2 rounded-md bg-card px-3 py-1 text-xs text-muted-foreground">
            <Activity className="size-3.5 text-brand-bright" />
            connect.centennialinfotech.com/dashboard
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {miniStats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border/70 bg-secondary/40 p-3">
                  <span className={`inline-flex size-8 items-center justify-center rounded-lg ${s.tone}`}>
                    <s.icon className="size-4" />
                  </span>
                  <p className="mt-2 font-display text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Call Volume</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-semibold text-success">
                <TrendingUp className="size-3" /> Live
              </span>
            </div>
            <BarChart data={callVolumeSeries} height={150} showSecondary />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card-hover)] sm:flex">
        <span className="flex size-9 items-center justify-center rounded-lg bg-violet/10 text-violet">
          <Bot className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">AI Agent handled a call</p>
          <p className="text-[11px] text-muted-foreground">Demo booked · 2:48</p>
        </div>
      </div>

      <div className="absolute -right-4 -top-5 hidden items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card-hover)] sm:flex">
        <span className="flex size-9 items-center justify-center rounded-lg bg-info/10 text-info">
          <Phone className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">Inbound · +1 (415)</p>
          <p className="text-[11px] text-muted-foreground">Connected in 0.8s</p>
        </div>
      </div>
    </div>
  )
}
