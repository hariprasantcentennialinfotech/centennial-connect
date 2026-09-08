// Service layer for Centennial Connect.
// Connects directly to MongoDB when available, with resilient fallback to the mock repository.

import {
  activityLog,
  aiVsHumanSeries,
  callVolumeSeries,
  calls as mockCalls,
  campaigns as mockCampaigns,
  contacts as mockContacts,
  dashboardStats,
  demoOrganization,
  demoUser,
  durationSeries,
  phoneNumbers as mockPhoneNumbers,
  sampleConversation,
  successRateSeries,
  teamMembers,
  usageByProduct,
  usageRecords,
  voiceAgents as mockVoiceAgents,
} from '@/lib/mock-data'
import { getDatabase, ensureDbSeeded } from '@/lib/mongodb'
import { mockNumberProvider } from '@/lib/providers/mock-provider'
import { getProviderStatus, type NumberSearchParams } from '@/lib/providers/telephony'
import type { Contact, Call, PhoneNumber, VoiceAgent, Campaign } from '@/lib/types'

export const analyticsService = {
  async getDashboard() {
    return {
      stats: dashboardStats,
      callVolume: callVolumeSeries,
      successRate: successRateSeries,
      duration: durationSeries,
      usageByProduct,
      activity: activityLog,
      usage: usageRecords,
    }
  },
  async getAnalytics() {
    return {
      callVolume: callVolumeSeries,
      successRate: successRateSeries,
      duration: durationSeries,
      aiVsHuman: aiVsHumanSeries,
      usageByProduct,
    }
  },
}

export const contactsService = {
  async list(): Promise<Contact[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const docs = await db.collection('contacts').find({}).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            name: d.name,
            company: d.company,
            phone: d.phone,
            email: d.email,
            status: d.status,
            tags: d.tags || [],
            lastContacted: d.lastContacted,
            notes: d.notes,
          }))
        }
      }
    } catch (err) {
      console.warn('MongoDB contacts list fallback:', err)
    }
    return mockContacts
  },

  async get(id: string): Promise<Contact | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const doc = await db.collection('contacts').findOne({ $or: [{ id }, { _id: id as unknown as never }] })
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            name: doc.name,
            company: doc.company,
            phone: doc.phone,
            email: doc.email,
            status: doc.status,
            tags: doc.tags || [],
            lastContacted: doc.lastContacted,
            notes: doc.notes,
          }
        }
      }
    } catch {
      // fallback
    }
    return mockContacts.find((c) => c.id === id) ?? null
  },

  async create(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: `c_${Date.now()}`,
    }
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('contacts').insertOne({ ...newContact })
      }
    } catch (err) {
      console.warn('MongoDB create contact fallback:', err)
    }
    return newContact
  },
}

export const numbersService = {
  async list(): Promise<PhoneNumber[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const docs = await db.collection('numbers').find({}).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            e164: d.e164,
            formatted: d.formatted,
            country: d.country,
            countryCode: d.countryCode,
            region: d.region,
            type: d.type,
            status: d.status,
            monthlyPrice: d.monthlyPrice,
            assignedTo: d.assignedTo,
            capabilities: d.capabilities || ['voice'],
          }))
        }
      }
    } catch (err) {
      console.warn('MongoDB numbers list fallback:', err)
    }
    return mockNumberProvider.list()
  },

  async search(params: NumberSearchParams) {
    return mockNumberProvider.search(params)
  },

  async provision(num: PhoneNumber): Promise<PhoneNumber> {
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('numbers').insertOne({ ...num })
      }
    } catch (err) {
      console.warn('MongoDB provision number fallback:', err)
    }
    return num
  },

  status: getProviderStatus,
}

export const callsService = {
  async list(): Promise<Call[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const docs = await db.collection('calls').find({}).sort({ timestamp: -1 }).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            contactName: d.contactName,
            contactId: d.contactId,
            phone: d.phone,
            type: d.type,
            agent: d.agent,
            status: d.status,
            durationSeconds: d.durationSeconds,
            timestamp: d.timestamp,
            direction: d.direction,
            recordingUrl: d.recordingUrl,
            notes: d.notes,
          }))
        }
      }
    } catch (err) {
      console.warn('MongoDB calls list fallback:', err)
    }
    return mockCalls
  },

  async get(id: string): Promise<Call | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const doc = await db.collection('calls').findOne({ $or: [{ id }, { _id: id as unknown as never }] })
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            contactName: doc.contactName,
            contactId: doc.contactId,
            phone: doc.phone,
            type: doc.type,
            agent: doc.agent,
            status: doc.status,
            durationSeconds: doc.durationSeconds,
            timestamp: doc.timestamp,
            direction: doc.direction,
            recordingUrl: doc.recordingUrl,
            notes: doc.notes,
          }
        }
      }
    } catch {
      // fallback
    }
    return mockCalls.find((c) => c.id === id) ?? null
  },
}

export const agentsService = {
  async list(): Promise<VoiceAgent[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const docs = await db.collection('agents').find({}).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            name: d.name,
            status: d.status,
            voice: d.voice,
            language: d.language,
            phoneNumber: d.phoneNumber,
            greeting: d.greeting,
            instructions: d.instructions,
            objective: d.objective,
            businessContext: d.businessContext,
            workingHours: d.workingHours,
            callVolume: d.callVolume,
            successRate: d.successRate,
            avgDurationSeconds: d.avgDurationSeconds,
          }))
        }
      }
    } catch (err) {
      console.warn('MongoDB agents list fallback:', err)
    }
    return mockVoiceAgents
  },

  async get(id: string): Promise<VoiceAgent | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const doc = await db.collection('agents').findOne({ $or: [{ id }, { _id: id as unknown as never }] })
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            name: doc.name,
            status: doc.status,
            voice: doc.voice,
            language: doc.language,
            phoneNumber: doc.phoneNumber,
            greeting: doc.greeting,
            instructions: doc.instructions,
            objective: doc.objective,
            businessContext: doc.businessContext,
            workingHours: doc.workingHours,
            callVolume: doc.callVolume,
            successRate: doc.successRate,
            avgDurationSeconds: doc.avgDurationSeconds,
          }
        }
      }
    } catch {
      // fallback
    }
    return mockVoiceAgents.find((a) => a.id === id) ?? mockVoiceAgents[0]
  },

  async update(id: string, updates: Partial<VoiceAgent>): Promise<VoiceAgent | null> {
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('agents').updateOne({ id }, { $set: updates })
      }
    } catch (err) {
      console.warn('MongoDB update agent fallback:', err)
    }
    const current = mockVoiceAgents.find((a) => a.id === id)
    return current ? { ...current, ...updates } : null
  },

  async sampleConversation() {
    return sampleConversation
  },
}

export const campaignsService = {
  async list(): Promise<Campaign[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const docs = await db.collection('campaigns').find({}).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            name: d.name,
            status: d.status,
            contactCount: d.contactCount,
            callsCompleted: d.callsCompleted,
            callsRemaining: d.callsRemaining,
            connected: d.connected,
            missed: d.missed,
            conversionRate: d.conversionRate,
            callerId: d.callerId,
            dialingMode: d.dialingMode,
            agent: d.agent,
            schedule: d.schedule,
          }))
        }
      }
    } catch (err) {
      console.warn('MongoDB campaigns list fallback:', err)
    }
    return mockCampaigns
  },

  async create(camp: Omit<Campaign, 'id'>): Promise<Campaign> {
    const newCamp: Campaign = {
      ...camp,
      id: `cmp_${Date.now()}`,
    }
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('campaigns').insertOne({ ...newCamp })
      }
    } catch (err) {
      console.warn('MongoDB create campaign fallback:', err)
    }
    return newCamp
  },
}

export const orgService = {
  async current() {
    try {
      const db = await getDatabase()
      if (db) {
        const u = await db.collection('users').findOne({})
        if (u) {
          return {
            organization: (u.organization as typeof demoOrganization) || demoOrganization,
            user: {
              id: u.id || String(u._id),
              name: u.name,
              email: u.email,
              avatarInitials: u.avatarInitials || u.name.slice(0, 2).toUpperCase(),
              role: u.role || 'owner',
              organizationId: u.organizationId || 'org_1',
              createdAt: u.createdAt || '2025-01-12T09:00:00Z',
            },
            team: teamMembers,
          }
        }
      }
    } catch {
      // fallback
    }
    return { organization: demoOrganization, user: demoUser, team: teamMembers }
  },
}

export { mockPhoneNumbers as phoneNumbers }
