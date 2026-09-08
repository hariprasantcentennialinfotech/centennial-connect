'use server'

import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { analyticsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function getAnalyticsAction(range: 'today' | '7d' | '30d' | '90d' = '7d') {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const analytics = await analyticsService.getAnalytics(ctx.organizationId, range)
    return { success: true, analytics }
  } catch (err) {
    logger.error('Failed to get analytics', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function getDashboardAction() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const dashboard = await analyticsService.getDashboard(ctx.organizationId)
    return { success: true, dashboard }
  } catch (err) {
    logger.error('Failed to get dashboard overview', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}
