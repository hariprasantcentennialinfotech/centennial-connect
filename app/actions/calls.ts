'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { callsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { Call, CallSentiment, CallStatus, CallType } from '@/lib/types'

const updateNotesSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
  notes: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
})

const deleteCallSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
})

const recordCallSchema = z.object({
  callId: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  type: z.enum(['inbound', 'outbound', 'ai']).default('outbound'),
  agent: z.string().optional(),
  durationSeconds: z.coerce.number().min(0).default(0),
  status: z.enum(['completed', 'missed', 'voicemail', 'failed', 'in-progress', 'queued', 'ringing', 'busy', 'no-answer']).default('completed'),
  notes: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
})

export async function getCallsAction() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const calls = await callsService.list(ctx.organizationId)
    return { success: true, calls }
  } catch (err) {
    logger.error('Failed to fetch calls for tenant', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function updateCallNotesAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = updateNotesSchema.parse(params)
    const updated = await callsService.update(
      parsed.callId,
      {
        notes: parsed.notes,
        ...(parsed.sentiment ? { sentiment: parsed.sentiment as CallSentiment } : {}),
      },
      ctx.organizationId
    )

    revalidatePath('/dashboard/calls')
    logger.info(`Call notes updated for ${parsed.callId} in org ${ctx.organizationId}`)
    return { success: true, call: updated }
  } catch (err) {
    logger.error('Failed to update call notes', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function deleteCallAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = typeof params === 'string' ? { callId: params } : deleteCallSchema.parse(params)
    const success = await callsService.delete(parsed.callId, ctx.organizationId)

    revalidatePath('/dashboard/calls')
    logger.info(`Call ${parsed.callId} deleted from org ${ctx.organizationId}`)
    return { success }
  } catch (err) {
    logger.error('Failed to delete call', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function recordCallAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = recordCallSchema.parse(params)
    const call = await callsService.create(
      {
        id: parsed.callId,
        contactName: parsed.contactName || 'Direct Contact',
        phone: parsed.phone,
        type: parsed.type as CallType,
        agent: parsed.agent || ctx.name || 'Sales Agent',
        status: parsed.status as CallStatus,
        durationSeconds: parsed.durationSeconds,
        direction: parsed.type === 'inbound' ? 'inbound' : 'outbound',
        notes: parsed.notes,
        sentiment: parsed.sentiment as CallSentiment,
        timestamp: new Date().toISOString(),
      },
      ctx.organizationId
    )

    revalidatePath('/dashboard/calls')
    logger.info(`Call recorded ${call.id} for org ${ctx.organizationId}`)
    return { success: true, call }
  } catch (err) {
    logger.error('Failed to record call', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}
