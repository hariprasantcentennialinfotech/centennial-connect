'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { numbersService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { PhoneNumber } from '@/lib/types'

const searchSchema = z.object({
  countryCode: z.string().min(2).max(2).default('US'),
  type: z.enum(['local', 'toll-free', 'mobile']).optional(),
  areaCode: z.string().optional(),
})

const purchaseSchema = z.object({
  numberId: z.string().min(1, 'Number ID is required'),
  phoneNumber: z.string().optional(),
  friendlyName: z.string().optional(),
})

const assignSchema = z.object({
  numberId: z.string().min(1, 'Number ID is required'),
  assignedTo: z.string().min(1, 'Assignment target is required'),
})

export async function searchNumbersAction(params: unknown) {
  try {
    const session = await getSession()
    ensureOrgContext(session)

    const parsed = searchSchema.parse(params)
    const results = await numbersService.search(parsed)
    return { success: true, numbers: results }
  } catch (err) {
    logger.warn('Search numbers action failed', { error: String(err) })
    return formatErrorResponse(err)
  }
}

export async function purchaseNumberAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = purchaseSchema.parse(params)
    const available = await numbersService.search({ countryCode: 'US' })
    const target = available.find((n) => n.id === parsed.numberId) || {
      id: parsed.numberId,
      e164: parsed.phoneNumber || `+1415555${Math.floor(1000 + Math.random() * 9000)}`,
      formatted: parsed.phoneNumber || `+1 (415) 555-${Math.floor(1000 + Math.random() * 9000)}`,
      country: 'United States',
      countryCode: 'US',
      region: 'San Francisco, CA',
      type: 'local' as const,
      status: 'active' as const,
      monthlyPrice: 3,
      capabilities: ['voice', 'sms'] as Array<'voice' | 'sms'>,
    }

    const provisioned = await numbersService.provision(
      {
        ...target,
        organizationId: ctx.organizationId,
        assignedTo: parsed.friendlyName || 'Unassigned',
      },
      ctx.organizationId
    )

    revalidatePath('/dashboard/virtual-numbers')
    logger.info(`Number provisioned: ${provisioned.formatted} for org ${ctx.organizationId}`)
    return { success: true, number: provisioned }
  } catch (err) {
    logger.error('Purchase number action failed', err)
    return formatErrorResponse(err)
  }
}

export async function releaseNumberAction(numberId: string) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!numberId) throw new Error('Number ID is required.')
    await numbersService.release(numberId, ctx.organizationId)

    revalidatePath('/dashboard/virtual-numbers')
    logger.info(`Number released: ${numberId} by org ${ctx.organizationId}`)
    return { success: true }
  } catch (err) {
    logger.error('Release number action failed', err)
    return formatErrorResponse(err)
  }
}

export async function assignNumberAction(params: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = assignSchema.parse(params)
    await numbersService.assign(parsed.numberId, parsed.assignedTo, ctx.organizationId)

    revalidatePath('/dashboard/virtual-numbers')
    logger.info(`Number assigned: ${parsed.numberId} to ${parsed.assignedTo}`)
    return { success: true }
  } catch (err) {
    logger.error('Assign number action failed', err)
    return formatErrorResponse(err)
  }
}
