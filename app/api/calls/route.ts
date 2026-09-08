import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { callsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { CallSentiment, CallStatus, CallType } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const searchParams = request.nextUrl.searchParams
    const typeFilter = searchParams.get('type')
    const statusFilter = searchParams.get('status')
    const searchQuery = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined

    let calls = await callsService.list(ctx.organizationId)

    if (typeFilter && typeFilter !== 'all') {
      calls = calls.filter((c) => c.type === typeFilter)
    }

    if (statusFilter && statusFilter !== 'all') {
      calls = calls.filter((c) => c.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      calls = calls.filter(
        (c) =>
          c.contactName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.agent.toLowerCase().includes(q) ||
          (c.notes && c.notes.toLowerCase().includes(q))
      )
    }

    if (limit && limit > 0) {
      calls = calls.slice(0, limit)
    }

    logger.info(`Calls fetched for org ${ctx.organizationId}: ${calls.length} records`)
    return NextResponse.json({ calls, total: calls.length })
  } catch (err) {
    logger.error('GET /api/calls failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const body = await request.json()
    const { contactName, phone, type, agent, durationSeconds, status, notes, sentiment, transcript, recordingUrl } = body

    if (!phone) {
      return NextResponse.json({ error: 'phone is required' }, { status: 400 })
    }

    const newCall = await callsService.create(
      {
        contactName: contactName || 'Direct Contact',
        phone,
        type: (type as CallType) || 'outbound',
        agent: agent || ctx.name || 'Sales Agent',
        durationSeconds: durationSeconds || 0,
        status: (status as CallStatus) || 'completed',
        direction: type === 'inbound' ? 'inbound' : 'outbound',
        notes,
        sentiment: sentiment as CallSentiment,
        transcript,
        recordingUrl,
        timestamp: new Date().toISOString(),
      },
      ctx.organizationId
    )

    logger.info(`Call created via API: ${newCall.id} for org ${ctx.organizationId}`)
    return NextResponse.json({ call: newCall }, { status: 201 })
  } catch (err) {
    logger.error('POST /api/calls failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const body = await request.json()
    const { id, notes, status, sentiment } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updated = await callsService.update(
      id,
      {
        ...(notes !== undefined ? { notes } : {}),
        ...(status ? { status: status as CallStatus } : {}),
        ...(sentiment ? { sentiment: sentiment as CallSentiment } : {}),
      },
      ctx.organizationId
    )

    if (!updated) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 })
    }

    logger.info(`Call patched via API: ${id} for org ${ctx.organizationId}`)
    return NextResponse.json({ call: updated })
  } catch (err) {
    logger.error('PATCH /api/calls failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 })
    }

    const success = await callsService.delete(id, ctx.organizationId)
    if (!success) {
      return NextResponse.json({ error: 'Call not found or delete failed' }, { status: 404 })
    }

    logger.info(`Call deleted via API: ${id} for org ${ctx.organizationId}`)
    return NextResponse.json({ success: true, deletedId: id })
  } catch (err) {
    logger.error('DELETE /api/calls failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
