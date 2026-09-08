import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  // Optionally load fresh data from MongoDB
  try {
    const db = await getDatabase()
    if (db) {
      const dbUser = await db.collection('users').findOne({ email: session.email })
      if (dbUser) {
        return NextResponse.json({
          user: {
            name: dbUser.name || session.name,
            email: dbUser.email || session.email,
            avatarUrl: dbUser.avatarUrl || session.avatarUrl,
            avatarInitials:
              session.avatarInitials ||
              (dbUser.name ? dbUser.name.slice(0, 2).toUpperCase() : 'CC'),
            role: dbUser.role || session.role || 'owner',
          },
        })
      }
    }
  } catch (err) {
    console.warn('Session me route fallback:', err)
  }

  return NextResponse.json({ user: session })
}
