'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { campaignsService, contactsService, callsService } from '@/lib/services'
import { getTelephonyProvider } from '@/lib/providers'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { getDatabase } from '@/lib/mongodb'
import type { CallStatus } from '@/lib/types'

const outcomeSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
  status: z.enum(['completed', 'missed', 'voicemail', 'failed', 'in-progress', 'no-answer', 'busy']),
  durationSeconds: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
})

const dialSchema = z.object({
  campaignId: z.string().optional(),
  contactId: z.string().min(1, 'Contact ID is required'),
  fromNumber: z.string().optional(),
})

export async function startCampaignAction(campaignId: string) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!campaignId) throw new Error('Campaign ID is required.')
    await campaignsService.update(campaignId, { status: 'active' }, ctx.organizationId)

    revalidatePath('/dashboard/power-dialer')
    logger.info(`Campaign ${campaignId} started for org ${ctx.organizationId}`)
    return { success: true }
  } catch (err) {
    logger.error('Start campaign action failed', err)
    return formatErrorResponse(err)
  }
}

export async function pauseCampaignAction(campaignId: string) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!campaignId) throw new Error('Campaign ID is required.')
    await campaignsService.update(campaignId, { status: 'paused' }, ctx.organizationId)

    revalidatePath('/dashboard/power-dialer')
    logger.info(`Campaign ${campaignId} paused for org ${ctx.organizationId}`)
    return { success: true }
  } catch (err) {
    logger.error('Pause campaign action failed', err)
    return formatErrorResponse(err)
  }
}

export async function dialNextContactAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = dialSchema.parse(params)
    const contact = await contactsService.get(parsed.contactId, ctx.organizationId)
    if (!contact) throw new Error('Target contact not found.')

    const callerId = parsed.fromNumber || '+14155550100'
    const provider = getTelephonyProvider()

    const { callId, providerCallId } = await provider.placeCall({
      from: callerId,
      to: contact.phone,
      organizationId: ctx.organizationId,
      contactId: contact.id,
      campaignId: parsed.campaignId,
    })

    const db = await getDatabase()
    if (db) {
      await db.collection('calls').insertOne({
        id: callId,
        organizationId: ctx.organizationId,
        contactName: contact.name,
        contactId: contact.id,
        phone: contact.phone,
        type: 'outbound',
        agent: ctx.name || 'Sales Agent',
        campaignId: parsed.campaignId,
        status: 'in-progress' as CallStatus,
        durationSeconds: 0,
        timestamp: new Date().toISOString(),
        direction: 'outbound',
        providerCallId,
        createdAt: new Date().toISOString(),
      })
    }

    revalidatePath('/dashboard/power-dialer')
    revalidatePath('/dashboard/calls')
    logger.info(`Dialed contact ${contact.name} (${contact.phone}) in campaign ${parsed.campaignId || 'manual'}`)
    return { success: true, callId }
  } catch (err) {
    logger.error('Dial next contact action failed', err)
    return formatErrorResponse(err)
  }
}

export async function logCallOutcomeAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = outcomeSchema.parse(params)
    const db = await getDatabase()
    if (db) {
      await db.collection('calls').updateOne(
        { id: parsed.callId, organizationId: ctx.organizationId },
        {
          $set: {
            status: parsed.status,
            durationSeconds: parsed.durationSeconds,
            notes: parsed.notes,
            endedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      )
    }

    revalidatePath('/dashboard/calls')
    revalidatePath('/dashboard/power-dialer')
    logger.info(`Call outcome logged for ${parsed.callId}: ${parsed.status}`)
    return { success: true }
  } catch (err) {
    logger.error('Log call outcome action failed', err)
    return formatErrorResponse(err)
  }
}
