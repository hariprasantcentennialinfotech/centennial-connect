import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5">
        <path
          d="M7.5 15.5a4.5 4.5 0 0 1 0-7l2-2M16.5 8.5a4.5 4.5 0 0 1 0 7l-2 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9.5 14.5l5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function Logo({
  className,
  href = '/',
  compact = false,
}: {
  className?: string
  href?: string
  compact?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn('inline-flex items-center gap-2.5 outline-none', className)}
    >
      <LogoMark />
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-extrabold tracking-tight text-foreground">
            Centennial <span className="text-brand-bright">Connect</span>
          </span>
          <span className="mt-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
            by Centennial InfoTech
          </span>
        </span>
      ) : null}
    </Link>
  )
}
