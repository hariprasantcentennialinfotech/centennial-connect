import { cn } from '@/lib/utils'

interface PageHeaderProps {
  heading: string
  subheading?: string
  badge?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  heading,
  subheading,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60',
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {heading}
          </h1>
          {badge ? (
            <span className="inline-flex items-center rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-semibold text-brand-primary ring-1 ring-brand-primary/20">
              {badge}
            </span>
          ) : null}
        </div>
        {subheading ? (
          <p className="text-sm text-muted-foreground">{subheading}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2.5">{children}</div> : null}
    </div>
  )
}
