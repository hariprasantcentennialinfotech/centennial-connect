import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger'

export const SESSION_COOKIE = 'cc_session'

export interface Session {
  userId?: string
  name: string
  email: string
  organizationId?: string
  role?: 'owner' | 'admin' | 'agent' | 'viewer' | string
  avatarUrl?: string
  avatarInitials?: string
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

// Secret key for HMAC-SHA256 signature
const getSecretKey = () => {
  const secret = env.SESSION_SECRET || 'development_session_secret_min_32_characters_long_key_cc'
  return new TextEncoder().encode(secret)
}

function computeInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CC'
}

/**
 * Creates a cryptographically signed JWT session token.
 */
export async function createSessionToken(session: Session): Promise<string> {
  const initials = session.avatarInitials || computeInitials(session.name)
  const payload: Session = {
    ...session,
    avatarInitials: initials,
  }

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey())
}

/**
 * Backward compatibility alias for createSessionToken.
 */
export async function encodeSession(session: Session): Promise<string> {
  return createSessionToken(session)
}

/**
 * Verifies and decodes a session token. Supports backward-compatible migration
 * from legacy base64-encoded session strings.
 */
export async function verifySessionToken(token: string): Promise<Session | null> {
  if (!token) return null

  // 1. Attempt JWT verification
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const session = payload as unknown as Session
    if (session?.email) {
      if (!session.avatarInitials && session.name) {
        session.avatarInitials = computeInitials(session.name)
      }
      return session
    }
  } catch {
    // JWT verification failed or token is legacy base64 format
  }

  // 2. Fallback: Parse legacy base64 JSON session (for seamless dev transition)
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf8')) as Session
    if (parsed?.email) {
      if (!parsed.avatarInitials && parsed.name) {
        parsed.avatarInitials = computeInitials(parsed.name)
      }
      logger.info(`Upgraded legacy session for ${parsed.email}`)
      return parsed
    }
  } catch {
    // Not a valid legacy token either
  }

  return null
}

/**
 * Reads and verifies the current session from the HTTP-only cookie.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const store = await cookies()
    const raw = store.get(SESSION_COOKIE)?.value
    if (!raw) return null
    return await verifySessionToken(raw)
  } catch (err) {
    logger.error('Error reading session cookie', err)
    return null
  }
}
