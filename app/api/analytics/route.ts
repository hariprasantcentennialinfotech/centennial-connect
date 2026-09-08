import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { analyticsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || '7d'

    const analytics = await analyticsService.getAnalytics(ctx.organizationId, range)
    logger.info(`Analytics generated for org ${ctx.organizationId}, range: ${range}`)
    return NextResponse.json({ analytics })
  } catch (err) {
    logger.error('GET /api/analytics failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
