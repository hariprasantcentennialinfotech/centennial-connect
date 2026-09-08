'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { ensureOrgContext } from '@/lib/db/tenancy'
import { contactsService } from '@/lib/services'
import { formatErrorResponse } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { getDatabase } from '@/lib/mongodb'
import type { Contact, ContactStatus } from '@/lib/types'

const contactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email('Valid email is required').or(z.literal('')),
  company: z.string().optional().default(''),
  status: z.enum(['lead', 'active', 'customer', 'do-not-call', 'inactive', 'contacted', 'qualified']).default('lead'),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
})

const updateSchema = contactSchema.partial().extend({
  id: z.string().min(1, 'Contact ID is required'),
})

export async function getContactsAction() {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const contacts = await contactsService.list(ctx.organizationId)
    return { success: true, contacts }
  } catch (err) {
    logger.error('Get contacts action failed', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function createContactAction(data: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = contactSchema.parse(data)
    const newContact = await contactsService.create(
      {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || '',
        company: parsed.company || '',
        status: parsed.status as ContactStatus,
        tags: parsed.tags || [],
        notes: parsed.notes,
        lastContacted: null,
      },
      ctx.organizationId
    )

    revalidatePath('/dashboard/contacts')
    logger.info(`Contact created: ${newContact.name} for org ${ctx.organizationId}`)
    return { success: true, contact: newContact }
  } catch (err) {
    logger.error('Create contact action failed', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function updateContactAction(data: unknown) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    const parsed = updateSchema.parse(data)
    const { id, ...updates } = parsed

    const updated = await contactsService.update(id, updates as Partial<Contact>, ctx.organizationId)
    if (!updated) throw new Error('Contact not found or update failed.')

    revalidatePath('/dashboard/contacts')
    logger.info(`Contact updated: ${id} for org ${ctx.organizationId}`)
    return { success: true, contact: updated }
  } catch (err) {
    logger.error('Update contact action failed', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function deleteContactAction(contactId: string) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!contactId) throw new Error('Contact ID is required.')
    await contactsService.delete(contactId, ctx.organizationId)

    revalidatePath('/dashboard/contacts')
    logger.info(`Contact deleted: ${contactId} by org ${ctx.organizationId}`)
    return { success: true }
  } catch (err) {
    logger.error('Delete contact action failed', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}

export async function importContactsAction(contactsList: unknown[]) {
  try {
    const session = await getSession()
    const ctx = ensureOrgContext(session)

    if (!Array.isArray(contactsList) || contactsList.length === 0) {
      throw new Error('Contacts list must be a non-empty array.')
    }

    const validContacts: Contact[] = []
    for (const item of contactsList) {
      const parsed = contactSchema.safeParse(item)
      if (parsed.success) {
        validContacts.push({
          id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          organizationId: ctx.organizationId,
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email || '',
          company: parsed.data.company || '',
          status: parsed.data.status as ContactStatus,
          tags: parsed.data.tags || [],
          notes: parsed.data.notes,
          lastContacted: null,
          createdAt: new Date().toISOString(),
        })
      }
    }

    if (validContacts.length === 0) {
      throw new Error('No valid contacts could be parsed from input.')
    }

    const db = await getDatabase()
    if (db) {
      await db.collection('contacts').insertMany(validContacts)
    }

    revalidatePath('/dashboard/contacts')
    logger.info(`Bulk imported ${validContacts.length} contacts for org ${ctx.organizationId}`)
    return { success: true, importedCount: validContacts.length }
  } catch (err) {
    logger.error('Import contacts action failed', err)
    return { success: false, ...formatErrorResponse(err) }
  }
}
