import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'cc_session'

export interface Session {
  name: string
  email: string
}

/**
 * Reads the demo session from an httpOnly cookie. This is a mock session for
 * the prototype — a real implementation would verify a signed token or look up
 * a server-side session record.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, 'base64').toString('utf8'),
    ) as Session
    if (parsed?.email) return parsed
    return null
  } catch {
    return null
  }
}

export function encodeSession(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString('base64')
}
