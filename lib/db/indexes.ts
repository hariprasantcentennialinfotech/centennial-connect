import type { Db } from 'mongodb'
import { logger } from '@/lib/logger'

/**
 * Defines and ensures all production indexes exist in MongoDB Atlas.
 * Guarantees high-performance multi-tenant querying and enforces uniqueness constraints.
 */
export async function ensureIndexes(db: Db): Promise<void> {
  try {
    // 1. Users collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true, name: 'idx_users_email_unique' },
      { key: { organizationId: 1 }, name: 'idx_users_organizationId' },
      { key: { googleId: 1 }, sparse: true, name: 'idx_users_googleId' },
    ])

    // 2. Organizations collection indexes
    await db.collection('organizations').createIndexes([
      { key: { id: 1 }, unique: true, name: 'idx_orgs_id_unique' },
      { key: { slug: 1 }, sparse: true, name: 'idx_orgs_slug' },
    ])

    // 3. Contacts collection indexes
    await db.collection('contacts').createIndexes([
      { key: { organizationId: 1, id: 1 }, unique: true, name: 'idx_contacts_org_id_unique' },
      { key: { organizationId: 1, phone: 1 }, name: 'idx_contacts_org_phone' },
      { key: { organizationId: 1, email: 1 }, name: 'idx_contacts_org_email' },
      { key: { organizationId: 1, status: 1 }, name: 'idx_contacts_org_status' },
      { key: { organizationId: 1, lastContacted: -1 }, name: 'idx_contacts_org_lastContacted' },
    ])

    // 4. Virtual Numbers collection indexes
    await db.collection('numbers').createIndexes([
      { key: { id: 1 }, unique: true, name: 'idx_numbers_id_unique' },
      { key: { organizationId: 1, status: 1 }, name: 'idx_numbers_org_status' },
      { key: { e164: 1 }, sparse: true, name: 'idx_numbers_e164' },
    ])

    // 5. Voice Agents collection indexes
    await db.collection('agents').createIndexes([
      { key: { organizationId: 1, id: 1 }, unique: true, name: 'idx_agents_org_id_unique' },
      { key: { organizationId: 1, status: 1 }, name: 'idx_agents_org_status' },
    ])

    // 6. Calls collection indexes
    await db.collection('calls').createIndexes([
      { key: { organizationId: 1, id: 1 }, unique: true, name: 'idx_calls_org_id_unique' },
      { key: { organizationId: 1, timestamp: -1 }, name: 'idx_calls_org_timestamp' },
      { key: { organizationId: 1, contactId: 1 }, name: 'idx_calls_org_contactId' },
      { key: { organizationId: 1, status: 1 }, name: 'idx_calls_org_status' },
    ])

    // 7. Campaigns collection indexes
    await db.collection('campaigns').createIndexes([
      { key: { organizationId: 1, id: 1 }, unique: true, name: 'idx_campaigns_org_id_unique' },
      { key: { organizationId: 1, status: 1 }, name: 'idx_campaigns_org_status' },
    ])

    logger.info('✅ Production MongoDB indexes verified and active.')
  } catch (err) {
    logger.warn('Index initialization encountered a warning (continuing):', {
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
