import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      aria-hidden="true"
    >
      <Image
        src="/favicon.png"
        alt=""
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </span>
  )
}

export function Logo({
  className,
  href = '/',
  compact = false,
  size = 36,
}: {
  className?: string
  href?: string
  compact?: boolean
  size?: number
}) {
  return (
    <Link
      href={href}
      className={cn('inline-flex items-center gap-2.5 outline-none', className)}
    >
      <LogoMark size={size} />
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
