import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { getTelephonyProvider } from '@/lib/providers'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const provider = getTelephonyProvider()
    const tokenResult = await provider.generateWebRTCToken({
      identity: ctx.email,
      organizationId: ctx.organizationId,
    })

    logger.info(`Issued WebRTC token for ${ctx.email} (Provider: ${tokenResult.provider})`)

    return NextResponse.json({
      success: true,
      ...tokenResult,
    })
  } catch (err) {
    logger.error('WebRTC token issuance failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
