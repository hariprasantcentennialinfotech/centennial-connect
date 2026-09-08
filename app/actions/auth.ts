'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { encodeSession, SESSION_COOKIE } from '@/lib/auth'
import { getDatabase, ensureDbSeeded } from '@/lib/mongodb'

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
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  try {
    await ensureDbSeeded()
    const db = await getDatabase()
    if (db) {
      const user = await db.collection('users').findOne({ email })
      if (user && user.passwordHash && user.passwordHash !== password) {
        return { error: 'Invalid password. Please check your credentials.' }
      }
    }
  } catch (err) {
    console.warn('MongoDB login check fallback:', err)
  }

  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const store = await cookies()
  store.set(SESSION_COOKIE, encodeSession({ name, email }), cookieOptions)
  redirect('/dashboard')
}

export async function register(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirm = String(formData.get('confirmPassword') ?? '')
  const company = String(formData.get('company') ?? '').trim()

  if (name.length < 2) return { error: 'Please enter your full name.' }
  if (!isValidEmail(email)) return { error: 'Please enter a valid email address.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }

  try {
    await ensureDbSeeded()
    const db = await getDatabase()
    if (db) {
      const existing = await db.collection('users').findOne({ email })
      if (existing) {
        return { error: 'An account with this email already exists. Please log in.' }
      }
      await db.collection('users').insertOne({
        id: `usr_${Date.now()}`,
        name,
        email,
        company: company || 'My Company',
        passwordHash: password,
        role: 'owner',
        createdAt: new Date().toISOString(),
      })
    }
  } catch (err) {
    console.warn('MongoDB register fallback:', err)
  }

  const store = await cookies()
  store.set(SESSION_COOKIE, encodeSession({ name, email }), cookieOptions)
  redirect('/dashboard')
}

export async function logout() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect('/login')
}
