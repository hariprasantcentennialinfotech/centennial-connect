import { NextResponse, type NextRequest } from 'next/server'
import { encodeSession, SESSION_COOKIE } from '@/lib/auth'
import { getDatabase, ensureDbSeeded } from '@/lib/mongodb'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    request.nextUrl.origin

  if (error || !code) {
    console.warn('Google OAuth cancellation or error:', error)
    return NextResponse.redirect(new URL('/login?error=Google sign-in was cancelled', origin))
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${origin}/api/auth/callback/google`

  if (!clientId || !clientSecret) {
    console.error('Missing Google OAuth credentials in environment')
    return NextResponse.redirect(new URL('/login?error=Google OAuth configuration missing', origin))
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text()
      console.error('Google token exchange error:', errText)
      return NextResponse.redirect(new URL('/login?error=Failed to exchange token with Google', origin))
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token

    // 2. Fetch Google user profile
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userinfoResponse.ok) {
      console.error('Google userinfo fetch error')
      return NextResponse.redirect(new URL('/login?error=Failed to fetch Google user profile', origin))
    }

    const profile = await userinfoResponse.json()
    const email = String(profile.email || '').trim().toLowerCase()
    const name = String(profile.name || email.split('@')[0] || 'User').trim()
    const avatarUrl = profile.picture || ''
    const googleId = profile.sub

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=No email associated with Google account', origin))
    }

    // 3. Save / Upsert user in MongoDB Atlas
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        await db.collection('users').updateOne(
          { email },
          {
            $set: {
              name,
              avatarUrl,
              googleId,
              emailVerified: profile.email_verified || true,
              lastLoginAt: new Date().toISOString(),
            },
            $setOnInsert: {
              id: `usr_${Date.now()}`,
              email,
              company: 'My Company',
              role: 'owner',
              createdAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        )
        console.log(`✅ [MongoDB] Google User synced: ${email}`)
      }
    } catch (dbErr) {
      console.warn('MongoDB Google user persistence fallback:', dbErr)
    }

    // 4. Encode session and create redirect response
    const sessionData = {
      name,
      email,
      avatarUrl,
      role: 'owner',
    }

    const redirectResponse = NextResponse.redirect(new URL('/dashboard', origin))
    redirectResponse.cookies.set(SESSION_COOKIE, encodeSession(sessionData), cookieOptions)

    return redirectResponse
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Google OAuth callback handler exception:', msg)
    return NextResponse.redirect(new URL('/login?error=Authentication error occurred', origin))
  }
}
