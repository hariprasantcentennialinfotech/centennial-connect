'use client'

import * as React from 'react'
import type { TimeSeriesPoint } from '@/lib/types'
import { cn } from '@/lib/utils'

/* ------------------------------ Bar chart ------------------------------ */

export function BarChart({
  data,
  height = 200,
  showSecondary = false,
  primaryLabel = 'Total',
  secondaryLabel = 'Connected',
  className,
}: {
  data: TimeSeriesPoint[]
  height?: number
  showSecondary?: boolean
  primaryLabel?: string
  secondaryLabel?: string
  className?: string
}) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary ?? 0))) * 1.15 || 1

  return (
    <div className={className}>
      {showSecondary ? (
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-chart-1" /> {primaryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-chart-2" /> {secondaryLabel}
          </span>
        </div>
      ) : null}
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex w-full items-end justify-center gap-1" style={{ height: '100%' }}>
              <div
                className="w-full max-w-6 origin-bottom animate-[grow_0.8s_ease-out] rounded-t-md bg-chart-1"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={`${primaryLabel}: ${d.value}`}
              />
              {showSecondary && d.secondary !== undefined ? (
                <div
                  className="w-full max-w-6 origin-bottom animate-[grow_0.8s_ease-out] rounded-t-md bg-chart-2"
                  style={{ height: `${(d.secondary / max) * 100}%` }}
                  title={`${secondaryLabel}: ${d.secondary}`}
                />
              ) : null}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ Line chart ------------------------------ */

export function LineChart({
  data,
  height = 200,
  suffix = '',
  className,
}: {
  data: TimeSeriesPoint[]
  height?: number
  suffix?: string
  className?: string
}) {
  const width = 600
  const pad = 8
  const max = Math.max(...data.map((d) => d.value)) * 1.1 || 1
  const min = Math.min(...data.map((d) => d.value)) * 0.9
  const range = max - min || 1
  const stepX = (width - pad * 2) / (data.length - 1)

  const points = data.map((d, i) => {
    const x = pad + i * stepX
    const y = height - pad - ((d.value - min) / range) * (height - pad * 2)
    return { x, y, d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - pad} L${points[0].x},${height - pad} Z`

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        style={{ height }}
        preserveAspectRatio="none"
        role="img"
        aria-label="Line chart"
      >
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#lineFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke-dasharray:2000] [stroke-dashoffset:2000] animate-[draw_1.4s_ease-out_forwards] motion-reduce:animate-none motion-reduce:[stroke-dashoffset:0]"
        />
        {points.map((p) => (
          <circle key={p.d.label} cx={p.x} cy={p.y} r="3.5" fill="var(--card)" stroke="var(--chart-1)" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-3 flex justify-between px-1">
        {data.map((d) => (
          <span key={d.label} className="text-[11px] font-medium text-muted-foreground">
            {d.label}
            {suffix && <span className="sr-only">{d.value}{suffix}</span>}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ Donut chart ------------------------------ */

const donutColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function DonutChart({
  data,
  className,
  centerLabel,
}: {
  data: TimeSeriesPoint[]
  className?: string
  centerLabel?: string
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  const radius = 60
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className={cn('flex flex-col items-center gap-6 sm:flex-row sm:justify-center', className)}>
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 160 160" className="size-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--muted)" strokeWidth="18" />
          {data.map((d, i) => {
            const fraction = d.value / total
            const dash = fraction * circumference
            const seg = (
              <circle
                key={d.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={donutColors[i % donutColors.length]}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            )
            offset += dash
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-extrabold text-foreground">{total}%</span>
          {centerLabel ? <span className="text-xs text-muted-foreground">{centerLabel}</span> : null}
        </div>
      </div>
      <ul className="flex flex-col gap-2.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: donutColors[i % donutColors.length] }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="ml-auto font-semibold text-foreground">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------ Sparkline ------------------------------ */

export function Sparkline({
  data,
  className,
  tone = 'var(--chart-1)',
}: {
  data: number[]
  className?: string
  tone?: string
}) {
  const width = 100
  const height = 32
  const max = Math.max(...data) || 1
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const path = data
    .map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn('h-8 w-24', className)} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
