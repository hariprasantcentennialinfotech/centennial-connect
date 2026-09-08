'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '').trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setSubmitted(true)
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      {submitted ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="size-7" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold text-foreground">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            If an account exists with that email, we've sent password reset instructions. Check your inbox and spam folder.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            render={<Link href="/login" />}
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-7" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold text-foreground">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-email">Email address</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Send reset instructions
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="inline-flex items-center gap-1 font-medium text-brand-bright hover:underline">
              <ArrowLeft className="size-3" />
              Back to login
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
