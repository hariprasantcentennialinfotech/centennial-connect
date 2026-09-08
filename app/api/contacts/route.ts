import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { contactsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import type { ContactStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const searchParams = request.nextUrl.searchParams
    const statusFilter = searchParams.get('status')
    const searchQuery = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined

    let contacts = await contactsService.list(ctx.organizationId)

    if (statusFilter && statusFilter !== 'all') {
      contacts = contacts.filter((c) => c.status === statusFilter)
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      contacts = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (limit && limit > 0) {
      contacts = contacts.slice(0, limit)
    }

    logger.info(`Contacts fetched for org ${ctx.organizationId}: ${contacts.length} records`)
    return NextResponse.json({ contacts, total: contacts.length })
  } catch (err) {
    logger.error('GET /api/contacts failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const body = await request.json()

    // Handle bulk import
    if (body.contacts && Array.isArray(body.contacts)) {
      const imported = []
      for (const item of body.contacts) {
        if (item.name && item.phone) {
          const contact = await contactsService.create(
            {
              name: item.name,
              phone: item.phone,
              email: item.email || '',
              company: item.company || '',
              status: (item.status as ContactStatus) || 'lead',
              tags: Array.isArray(item.tags) ? item.tags : [],
              notes: item.notes,
              lastContacted: null,
            },
            ctx.organizationId
          )
          imported.push(contact)
        }
      }
      logger.info(`Bulk imported ${imported.length} contacts via API for org ${ctx.organizationId}`)
      return NextResponse.json({ success: true, count: imported.length, contacts: imported }, { status: 201 })
    }

    // Handle single contact creation
    const { name, phone, email, company, status, tags, notes } = body
    if (!name || !phone) {
      return NextResponse.json({ error: 'name and phone are required fields' }, { status: 400 })
    }

    const newContact = await contactsService.create(
      {
        name,
        phone,
        email: email || '',
        company: company || '',
        status: (status as ContactStatus) || 'lead',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        notes,
        lastContacted: null,
      },
      ctx.organizationId
    )

    logger.info(`Contact created via API: ${newContact.id} for org ${ctx.organizationId}`)
    return NextResponse.json({ contact: newContact }, { status: 201 })
  } catch (err) {
    logger.error('POST /api/contacts failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updated = await contactsService.update(id, updates, ctx.organizationId)
    if (!updated) {
      return NextResponse.json({ error: 'Contact not found or update failed' }, { status: 404 })
    }

    logger.info(`Contact patched via API: ${id} for org ${ctx.organizationId}`)
    return NextResponse.json({ contact: updated })
  } catch (err) {
    logger.error('PATCH /api/contacts failed', err)
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

    const success = await contactsService.delete(id, ctx.organizationId)
    if (!success) {
      return NextResponse.json({ error: 'Contact not found or delete failed' }, { status: 404 })
    }

    logger.info(`Contact deleted via API: ${id} for org ${ctx.organizationId}`)
    return NextResponse.json({ success: true, deletedId: id })
  } catch (err) {
    logger.error('DELETE /api/contacts failed', err)
    const errResp = formatErrorResponse(err)
    return NextResponse.json({ error: errResp.error }, { status: errResp.status })
  }
}
