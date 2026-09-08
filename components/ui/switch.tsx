'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  'aria-label'?: string
}

function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: SwitchProps) {
  const [internal, setInternal] = React.useState(defaultChecked ?? false)
  const isControlled = checked !== undefined
  const value = isControlled ? checked : internal

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      data-slot="switch"
      onClick={() => {
        if (!isControlled) setInternal(!value)
        onCheckedChange?.(!value)
      }}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors outline-none',
        'focus-visible:ring-3 focus-visible:ring-ring/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        value ? 'bg-primary' : 'bg-input',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-white shadow-sm transition-transform',
          value ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export { Switch }
