import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/charts/charts'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  prefix?: string
  suffix?: string
  delta?: number
  trend?: 'up' | 'down'
  sparklineData?: number[]
  sparklineColor?: string
  icon?: React.ReactNode
  description?: string
  className?: string
}

export function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  delta,
  trend = 'up',
  sparklineData,
  sparklineColor,
  icon,
  description,
  className,
}: StatCardProps) {
  const isPositive = delta !== undefined && delta >= 0

  return (
    <Card
      className={cn(
        'group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/30',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {prefix}
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix}
            </span>
          </div>
        </div>
        {icon ? (
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20 transition-transform group-hover:scale-110">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {delta !== undefined ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {delta}%
            </span>
            <span className="text-[10px] font-normal opacity-70">vs last wk</span>
          </div>
        ) : description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : <div />}

        {sparklineData && sparklineData.length > 0 ? (
          <div className="h-6 w-20">
            <Sparkline data={sparklineData} color={sparklineColor} />
          </div>
        ) : null}
      </div>
    </Card>
  )
}
