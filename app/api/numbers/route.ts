import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { numbersService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'

export async function GET() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const list = await numbersService.list(ctx.organizationId)
    return NextResponse.json({ success: true, numbers: list })
  } catch (err) {
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
