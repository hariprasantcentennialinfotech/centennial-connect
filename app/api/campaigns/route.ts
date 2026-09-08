import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { campaignsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const campaigns = await campaignsService.list(ctx.organizationId)
    logger.info(`Campaigns fetched for org ${ctx.organizationId}: ${campaigns.length} records`)
    return NextResponse.json({ campaigns })
  } catch (err) {
    logger.error('GET /api/campaigns failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const body = await request.json()
    const { name, dialingMode, callerId, contactCount, agent, schedule } = body

    if (!name || !dialingMode || !callerId) {
      return NextResponse.json({ error: 'name, dialingMode, and callerId are required' }, { status: 400 })
    }

    const newCampaign = await campaignsService.create(
      {
        name,
        dialingMode,
        callerId,
        contactCount: contactCount ?? 0,
        callsCompleted: 0,
        callsRemaining: contactCount ?? 0,
        connected: 0,
        missed: 0,
        conversionRate: 0,
        agent: agent ?? 'Unassigned',
        schedule: schedule ?? 'Mon–Fri, 9 AM – 5 PM',
        status: 'paused',
      },
      ctx.organizationId
    )

    logger.info(`Campaign created: ${name} for org ${ctx.organizationId}`)
    return NextResponse.json({ campaign: newCampaign }, { status: 201 })
  } catch (err) {
    logger.error('POST /api/campaigns failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
