'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encodeSession, SESSION_COOKIE } from '@/lib/auth'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export interface AuthResult {
  error?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function login(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const store = await cookies()
  store.set(SESSION_COOKIE, encodeSession({ name, email }), cookieOptions)
  redirect('/dashboard')
}

export async function register(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')

  if (name.length < 2) return { error: 'Please enter your full name.' }
  if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }

  const store = await cookies()
  store.set(SESSION_COOKIE, encodeSession({ name, email }), cookieOptions)
  redirect('/dashboard')
}

export async function logout() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect('/login')
}
