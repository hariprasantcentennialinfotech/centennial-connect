import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'cc_session'

export interface Session {
  name: string
  email: string
  avatarUrl?: string
  avatarInitials?: string
  role?: string
}

/**
 * Reads the session from the httpOnly cc_session cookie.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64').toString('utf8'),
    ) as Session
    if (parsed?.email) {
      if (!parsed.avatarInitials && parsed.name) {
        parsed.avatarInitials = parsed.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function encodeSession(session: Session): string {
  if (!session.avatarInitials && session.name) {
    session.avatarInitials = session.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return Buffer.from(JSON.stringify(session)).toString('base64')
}
