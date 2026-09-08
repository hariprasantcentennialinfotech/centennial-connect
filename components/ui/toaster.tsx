'use client'

import * as React from 'react'
import { CheckCircle2, Info, X, AlertTriangle, CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

type Listener = (toasts: Toast[]) => void

let toasts: Toast[] = []
const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l([...toasts])
}

export function toast(input: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, ...input }]
  emit()
  setTimeout(() => dismiss(id), 4500)
  return id
}

export function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

const iconMap = {
  default: Info,
  success: CheckCircle2,
  error: CircleAlert,
  warning: AlertTriangle,
}

const colorMap: Record<ToastVariant, string> = {
  default: 'text-info',
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-amber',
}

export function Toaster() {
  const [items, setItems] = React.useState<Toast[]>([])

  React.useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {items.map((t) => {
        const Icon = iconMap[t.variant ?? 'default']
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card-hover)] animate-in slide-in-from-bottom-3 fade-in"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', colorMap[t.variant ?? 'default'])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
