import { NextResponse, type NextRequest } from 'next/server'
import { getTelephonyProvider } from '@/lib/providers'
import { getDatabase, ensureDbSeeded } from '@/lib/mongodb'
import { logger } from '@/lib/logger'
import type { CallStatus } from '@/lib/types'

export async function POST(request: NextRequest) {
  const provider = getTelephonyProvider()
  const rawBody = await request.text()

  try {
    const { isValid, event, error } = await provider.verifyWebhook(
      request.headers,
      rawBody,
      request.url
    )

    if (!isValid && process.env.NODE_ENV === 'production') {
      logger.warn('Telephony webhook signature verification failed', { error })
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    if (!event) {
      return NextResponse.json({ received: true, note: 'No actionable event found' })
    }

    logger.info(`Telephony webhook event received: ${event.event}`, {
      callId: event.callId,
      from: event.from,
      to: event.to,
      provider: event.provider,
    })

    // Map provider event to internal CallStatus
    const statusMap: Record<string, CallStatus> = {
      'call.initiated': 'queued',
      'call.ringing': 'ringing',
      'call.answered': 'in-progress',
      'call.completed': 'completed',
    }

    const nextStatus = statusMap[event.event]

    // Sync state with MongoDB
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const updateFields: Record<string, unknown> = {
          updatedAt: new Date().toISOString(),
        }

        if (nextStatus) updateFields.status = nextStatus
        if (event.durationSeconds !== undefined) updateFields.durationSeconds = event.durationSeconds
        if (event.recordingUrl) updateFields.recordingUrl = event.recordingUrl
        if (event.event === 'call.completed') updateFields.endedAt = new Date().toISOString()

        const result = await db.collection('calls').updateOne(
          {
            $or: [
              { id: event.callId },
              { providerCallId: event.callId },
            ],
          },
          { $set: updateFields }
        )

        // If this is an inbound call not previously in DB, record it
        if (result.matchedCount === 0 && event.from && event.to) {
          await db.collection('calls').insertOne({
            id: `call_${Date.now()}`,
            organizationId: 'org_1',
            contactName: 'Inbound Caller',
            phone: event.from,
            type: 'inbound',
            agent: 'Virtual Agent',
            status: nextStatus || 'in-progress',
            durationSeconds: event.durationSeconds || 0,
            timestamp: new Date().toISOString(),
            direction: 'inbound',
            providerCallId: event.callId,
            recordingUrl: event.recordingUrl,
            createdAt: new Date().toISOString(),
          })
          logger.info(`Recorded new inbound call from ${event.from} to ${event.to}`)
        }
      }
    } catch (dbErr) {
      logger.error('Failed to sync webhook event to MongoDB', dbErr)
    }

    // Return vendor-appropriate responses
    if (event.provider === 'twilio') {
      const twiml = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
      return new Response(twiml, {
        headers: { 'Content-Type': 'text/xml' },
        status: 200,
      })
    }

    return NextResponse.json({
      received: true,
      event: event.event,
      callId: event.callId,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    logger.error('Telephony webhook processing error', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET() {
  const provider = getTelephonyProvider()
  return NextResponse.json({
    status: 'online',
    provider: provider.getStatus(),
  })
}
