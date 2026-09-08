import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { agentsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'

export async function GET() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const list = await agentsService.list(ctx.organizationId)
    const agent = list[0] || (await agentsService.get('va_1', ctx.organizationId))

    return NextResponse.json({ success: true, agent })
  } catch (err) {
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
