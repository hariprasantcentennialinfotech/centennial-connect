'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth'
import { getDatabase, ensureDbSeeded } from '@/lib/mongodb'
import { logger } from '@/lib/logger'

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

  let userId = `usr_${Date.now()}`
  let organizationId = 'org_default'
  let userName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  let userRole: 'owner' | 'admin' | 'agent' | 'viewer' = 'owner'

  try {
    await ensureDbSeeded()
    const db = await getDatabase()
    if (db) {
      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return { error: 'No account found with this email. Please register first.' }
      }

      const storedHash = user.passwordHash as string | undefined
      if (storedHash) {
        const isBcrypt = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')
        let passwordMatches = false

        if (isBcrypt) {
          passwordMatches = await bcrypt.compare(password, storedHash)
        } else if (storedHash === password) {
          // Legacy plaintext password detected - upgrade to bcrypt hash
          passwordMatches = true
          const upgradedHash = await bcrypt.hash(password, 10)
          await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { passwordHash: upgradedHash, updatedAt: new Date().toISOString() } }
          )
          logger.info(`Upgraded plaintext password for user: ${email}`)
        }

        if (!passwordMatches) {
          return { error: 'Invalid password. Please check your credentials.' }
        }
      }

      if (user.id) userId = user.id
      if (user.name) userName = user.name
      if (user.organizationId) organizationId = user.organizationId
      if (user.role) userRole = user.role
    }
  } catch (err) {
    logger.warn('MongoDB login check fallback:', { error: String(err) })
  }

  const token = await createSessionToken({
    userId,
    name: userName,
    email,
    organizationId,
    role: userRole,
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions)
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

  const userId = `usr_${Date.now()}`
  const organizationId = `org_${Date.now()}`

  try {
    await ensureDbSeeded()
    const db = await getDatabase()
    if (db) {
      const existing = await db.collection('users').findOne({ email })
      if (existing) {
        return { error: 'An account with this email already exists. Please log in.' }
      }

      // Hash password using bcrypt
      const passwordHash = await bcrypt.hash(password, 10)

      // Create organization and user
      await db.collection('organizations').insertOne({
        id: organizationId,
        name: company || `${name}'s Organization`,
        slug: (company || name).toLowerCase().replace(/[^a-z0-9]/g, '-'),
        createdAt: new Date().toISOString(),
      })

      await db.collection('users').insertOne({
        id: userId,
        name,
        email,
        company: company || 'My Company',
        organizationId,
        passwordHash,
        role: 'owner',
        createdAt: new Date().toISOString(),
      })

      logger.info(`New user registered: ${email}`)
    }
  } catch (err) {
    logger.warn('MongoDB register fallback:', { error: String(err) })
  }

  const token = await createSessionToken({
    userId,
    name,
    email,
    organizationId,
    role: 'owner',
  })

  const store = await cookies()
  store.set(SESSION_COOKIE, token, sessionCookieOptions)
  redirect('/dashboard')
}

export async function logout() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  redirect('/login')
}
