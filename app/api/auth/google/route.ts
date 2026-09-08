import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_CLIENT_ID is not configured in .env' },
      { status: 500 }
    )
  }

  // Derive redirect URI based on current request origin or NEXT_PUBLIC_APP_URL
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    request.nextUrl.origin
  const redirectUri = `${origin}/api/auth/callback/google`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  })

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return NextResponse.redirect(googleAuthUrl)
}
