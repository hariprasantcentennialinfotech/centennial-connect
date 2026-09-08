'use client'

import * as React from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register, type AuthResult } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(register, {})

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start your 14-day free trial of Centennial Connect
        </p>
      </div>

      {/* Google placeholder */}
      <button
        type="button"
        disabled
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
      >
        <svg className="size-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign up with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-name">Full name</Label>
          <Input
            id="reg-name"
            name="name"
            placeholder="Alex Morgan"
            required
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-company">Company</Label>
          <Input
            id="reg-company"
            name="company"
            placeholder="Acme Inc."
            autoComplete="organization"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-email">Work email</Label>
          <Input
            id="reg-email"
            name="email"
            type="email"
            placeholder="alex@company.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <Input
            id="reg-password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-confirm">Confirm password</Label>
          <Input
            id="reg-confirm"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          <UserPlus className="size-4" />
          {pending ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-brand-bright hover:underline">Terms</a>{' '}
          and{' '}
          <a href="#" className="text-brand-bright hover:underline">Privacy Policy</a>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand-bright hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
