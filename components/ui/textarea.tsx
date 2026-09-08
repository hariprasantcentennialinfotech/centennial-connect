import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-20 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none',
        'placeholder:text-muted-foreground/70 leading-relaxed',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
