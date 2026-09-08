'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { agentsService, callsService } from '@/lib/services'
import { getTelephonyProvider } from '@/lib/providers'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { getDatabase } from '@/lib/mongodb'
import type { VoiceAgent } from '@/lib/types'

const agentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Agent name must be at least 2 characters'),
  voice: z.string().default('Aria (Warm, Female)'),
  language: z.string().default('English (US)'),
  phoneNumber: z.string().min(6, 'Valid phone number is required'),
  greeting: z.string().min(5, 'Greeting is required'),
  instructions: z.string().min(10, 'Prompt instructions are required'),
  objective: z.string().default('Customer service and sales support'),
  businessContext: z.string().default('Centennial Connect AI voice assistant'),
  workingHours: z.string().default('Mon–Fri, 8:00 AM – 6:00 PM PT'),
  transferNumber: z.string().optional(),
  status: z.enum(['active', 'paused', 'offline']).default('active'),
})

export async function saveVoiceAgentAction(formData: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = agentSchema.parse(formData)
    const agentId = parsed.id || `va_${Date.now()}`

    const agentRecord: VoiceAgent = {
      ...parsed,
      id: agentId,
      organizationId: ctx.organizationId,
      callVolume: 0,
      successRate: 90,
      avgDurationSeconds: 150,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    const db = await getDatabase()
    if (db) {
      await db.collection('agents').updateOne(
        { id: agentId, organizationId: ctx.organizationId },
        { $set: agentRecord },
        { upsert: true }
      )
    } else {
      await agentsService.update(agentId, agentRecord, ctx.organizationId)
    }

    revalidatePath('/dashboard/voice-agent')
    logger.info(`Voice agent saved: ${parsed.name} (${agentId}) for org ${ctx.organizationId}`)
    return { success: true, agent: agentRecord }
  } catch (err) {
    logger.error('Save voice agent action failed', err)
    return formatErrorResponse(err)
  }
}

export async function updateAgentStatusAction(agentId: string, status: 'active' | 'paused' | 'offline') {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!agentId) throw new Error('Agent ID is required.')
    await agentsService.update(agentId, { status }, ctx.organizationId)

    revalidatePath('/dashboard/voice-agent')
    logger.info(`Agent ${agentId} status updated to ${status}`)
    return { success: true }
  } catch (err) {
    logger.error('Update agent status action failed', err)
    return formatErrorResponse(err)
  }
}

export async function triggerAgentTestCallAction(agentId: string, toPhone: string) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!agentId || !toPhone) {
      throw new Error('Agent ID and recipient phone number are required.')
    }

    const agent = await agentsService.get(agentId, ctx.organizationId)
    const provider = getTelephonyProvider()

    const { callId, providerCallId } = await provider.placeCall({
      from: agent?.phoneNumber || '+18005550111',
      to: toPhone,
      organizationId: ctx.organizationId,
      agentId,
    })

    const db = await getDatabase()
    if (db) {
      await db.collection('calls').insertOne({
        id: callId,
        organizationId: ctx.organizationId,
        contactName: 'Live Test Call',
        phone: toPhone,
        type: 'ai',
        agent: agent?.name || 'AI Voice Agent',
        agentId,
        status: 'in-progress',
        durationSeconds: 0,
        timestamp: new Date().toISOString(),
        direction: 'outbound',
        providerCallId,
        createdAt: new Date().toISOString(),
      })
    }

    revalidatePath('/dashboard/calls')
    revalidatePath('/dashboard/voice-agent')
    logger.info(`Test AI call initiated to ${toPhone} with agent ${agentId}`)
    return { success: true, callId }
  } catch (err) {
    logger.error('Trigger agent test call failed', err)
    return formatErrorResponse(err)
  }
}
