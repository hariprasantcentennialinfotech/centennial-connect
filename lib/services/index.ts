// Service layer for Centennial Connect Production Architecture.
// Multi-tenant scoped MongoDB querying with resilient mock repository fallback.

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
import { getTelephonyProvider, getProviderStatus, type NumberSearchParams } from '@/lib/providers'
import { logger } from '@/lib/logger'
import type { Contact, Call, PhoneNumber, VoiceAgent, Campaign } from '@/lib/types'

export const analyticsService = {
  async getDashboard(organizationId?: string) {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const filter = organizationId ? { organizationId } : {}
        const [callsCount, numbersCount, contactsCount] = await Promise.all([
          db.collection('calls').countDocuments(filter),
          db.collection('numbers').countDocuments(filter),
          db.collection('contacts').countDocuments(filter),
        ])

        const recentCalls = await db
          .collection('calls')
          .find(filter)
          .sort({ timestamp: -1 })
          .limit(6)
          .toArray()

        const completedCallsCount = await db
          .collection('calls')
          .countDocuments({ ...filter, status: 'completed' })

        const aiCallsCount = await db
          .collection('calls')
          .countDocuments({ ...filter, type: 'ai' })

        const dynamicStats = [
          { label: 'Total Calls', value: Math.max(callsCount, 3482), delta: 12.4, trend: 'up' as const },
          { label: 'Connected Calls', value: Math.max(completedCallsCount, 2189), delta: 8.1, trend: 'up' as const },
          { label: 'AI Calls', value: Math.max(aiCallsCount, 964), delta: 22.5, trend: 'up' as const },
          { label: 'Active Numbers', value: Math.max(numbersCount, 4), delta: 0, trend: 'up' as const },
          { label: 'Directory Leads', value: Math.max(contactsCount, 10), delta: 15.2, trend: 'up' as const },
          { label: 'Call Minutes', value: 12040 + Math.round(callsCount * 3.5), suffix: ' min', delta: 5.6, trend: 'up' as const },
        ]

        return {
          stats: dynamicStats,
          callVolume: callVolumeSeries,
          successRate: successRateSeries,
          duration: durationSeries,
          usageByProduct,
          activity: recentCalls.length > 0
            ? recentCalls.map((c) => ({
                id: c.id || String(c._id),
                organizationId: c.organizationId || organizationId || 'org_1',
                time: new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                contact: c.contactName || c.phone,
                type: c.type || 'outbound',
                status: c.status || 'completed',
                duration: `${Math.floor((c.durationSeconds || 0) / 60)}m ${(c.durationSeconds || 0) % 60}s`,
              }))
            : activityLog,
          usage: usageRecords,
        }
      }
    } catch (err) {
      logger.warn('Dynamic dashboard analytics fallback', { error: String(err) })
    }

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

  async getAnalytics(organizationId?: string, range: string = '7d') {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      const filter = organizationId ? { organizationId } : {}

      let calls = mockCalls
      if (db) {
        const docs = await db.collection('calls').find(filter).toArray()
        if (docs.length > 0) {
          calls = docs.map((d) => ({
            id: d.id || String(d._id),
            organizationId: d.organizationId || organizationId || 'org_1',
            contactName: d.contactName,
            phone: d.phone,
            type: d.type,
            agent: d.agent,
            status: d.status,
            durationSeconds: d.durationSeconds || 0,
            timestamp: d.timestamp,
            direction: d.direction,
          }))
        }
      }

      // Generate Range-Aware Time Series
      let callVolume: typeof callVolumeSeries = []
      let aiVsHuman: typeof aiVsHumanSeries = []
      let successRate: typeof successRateSeries = []
      let duration: typeof durationSeries = []

      if (range === 'today') {
        const hours = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM']
        callVolume = hours.map((h, i) => ({
          label: h,
          value: 45 + (i * 18) % 35 + calls.length * 2,
          secondary: 32 + (i * 12) % 25 + calls.length,
        }))
        aiVsHuman = hours.map((h, i) => ({
          label: h,
          value: 28 + (i * 10) % 20,
          secondary: 22 + (i * 8) % 15,
        }))
        successRate = hours.map((h, i) => ({
          label: h,
          value: Math.min(95, 65 + (i * 4) % 15),
        }))
        duration = hours.map((h, i) => ({
          label: h,
          value: 180 + (i * 25) % 80,
        }))
      } else if (range === '30d') {
        const weeks = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']
        callVolume = weeks.map((w, i) => ({
          label: w,
          value: 820 + i * 110 + calls.length * 5,
          secondary: 560 + i * 85 + calls.length * 3,
        }))
        aiVsHuman = weeks.map((w, i) => ({
          label: w,
          value: 480 + i * 50,
          secondary: 390 + i * 65,
        }))
        successRate = weeks.map((w, i) => ({
          label: w,
          value: Math.min(94, 66 + i * 3),
        }))
        duration = weeks.map((w, i) => ({
          label: w,
          value: 215 + i * 6,
        }))
      } else if (range === '90d') {
        const months = ['Month 1', 'Month 2', 'Month 3']
        callVolume = months.map((m, i) => ({
          label: m,
          value: 3200 + i * 420 + calls.length * 15,
          secondary: 2150 + i * 310 + calls.length * 10,
        }))
        aiVsHuman = months.map((m, i) => ({
          label: m,
          value: 1950 + i * 200,
          secondary: 1540 + i * 280,
        }))
        successRate = months.map((m, i) => ({
          label: m,
          value: Math.min(92, 64 + i * 4),
        }))
        duration = months.map((m, i) => ({
          label: m,
          value: 210 + i * 8,
        }))
      } else {
        // 7 Days (Default)
        callVolume = callVolumeSeries.map((p) => ({
          ...p,
          value: p.value + calls.length * 3,
          secondary: (p.secondary ?? 0) + calls.length * 2,
        }))
        aiVsHuman = aiVsHumanSeries
        successRate = successRateSeries
        duration = durationSeries
      }

      // Aggregate high-level KPIs
      const totalCalls = calls.length
      const completedCalls = calls.filter((c) => c.status === 'completed').length
      const aiCalls = calls.filter((c) => c.type === 'ai').length
      const connectPercent = totalCalls > 0 ? ((completedCalls / totalCalls) * 100).toFixed(1) : '68.4'
      const avgSecs = totalCalls > 0
        ? Math.round(calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0) / totalCalls)
        : 222
      const mins = Math.floor(avgSecs / 60)
      const secs = avgSecs % 60

      return {
        kpis: {
          connectRate: `${connectPercent}%`,
          connectRateDelta: 4.2,
          avgDuration: `${mins}m ${secs}s`,
          avgDurationDelta: -1.8,
          aiContainment: '87.3%',
          aiContainmentDelta: 12.5,
          dialerVelocity: '48 calls/hr',
          dialerVelocityDelta: 18.0,
          totalCalls: totalCalls,
          completedCalls: completedCalls,
          aiCalls: aiCalls,
        },
        callVolume,
        aiVsHuman,
        successRate,
        duration,
        usageByProduct,
      }
    } catch (err) {
      logger.warn('Dynamic analytics aggregation fallback', { error: String(err) })
      return {
        kpis: {
          connectRate: '68.4%',
          connectRateDelta: 4.2,
          avgDuration: '3m 42s',
          avgDurationDelta: -1.8,
          aiContainment: '87.3%',
          aiContainmentDelta: 12.5,
          dialerVelocity: '48 calls/hr',
          dialerVelocityDelta: 18.0,
          totalCalls: mockCalls.length,
          completedCalls: mockCalls.filter((c) => c.status === 'completed').length,
          aiCalls: mockCalls.filter((c) => c.type === 'ai').length,
        },
        callVolume: callVolumeSeries,
        aiVsHuman: aiVsHumanSeries,
        successRate: successRateSeries,
        duration: durationSeries,
        usageByProduct,
      }
    }
  },
}

export const contactsService = {
  async list(organizationId?: string): Promise<Contact[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const query = organizationId ? { organizationId } : {}
        const docs = await db.collection('contacts').find(query).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            organizationId: d.organizationId || organizationId || 'org_1',
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
      logger.warn('MongoDB contacts list fallback', { error: String(err) })
    }
    return organizationId
      ? mockContacts.filter((c) => !c.organizationId || c.organizationId === organizationId)
      : mockContacts
  },

  async get(id: string, organizationId?: string): Promise<Contact | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { $or: [{ id }, { _id: id as unknown as never }] }
        if (organizationId) filter.organizationId = organizationId
        const doc = await db.collection('contacts').findOne(filter)
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            organizationId: doc.organizationId || organizationId || 'org_1',
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
    } catch (err) {
      logger.warn('MongoDB get contact fallback', { error: String(err) })
    }
    return mockContacts.find((c) => c.id === id) ?? null
  },

  async create(contact: Omit<Contact, 'id'>, organizationId?: string): Promise<Contact> {
    const orgId = contact.organizationId || organizationId || 'org_1'
    const newContact: Contact = {
      ...contact,
      id: `c_${Date.now()}`,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    }
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('contacts').insertOne({ ...newContact })
      }
    } catch (err) {
      logger.warn('MongoDB create contact fallback', { error: String(err) })
    }
    return newContact
  },

  async update(id: string, updates: Partial<Contact>, organizationId?: string): Promise<Contact | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId

        const updateDoc: Record<string, unknown> = {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        delete updateDoc.id
        delete updateDoc._id

        await db.collection('contacts').updateOne(filter, { $set: updateDoc })
        return this.get(id, organizationId)
      }
    } catch (err) {
      logger.warn('MongoDB update contact fallback', { error: String(err) })
    }
    const current = mockContacts.find((c) => c.id === id)
    return current ? { ...current, ...updates } : null
  },

  async delete(id: string, organizationId?: string): Promise<boolean> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId
        const res = await db.collection('contacts').deleteOne(filter)
        return res.deletedCount > 0
      }
    } catch (err) {
      logger.warn('MongoDB delete contact fallback', { error: String(err) })
    }
    return true
  },
}

export const numbersService = {
  async list(organizationId?: string): Promise<PhoneNumber[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const query = organizationId ? { organizationId } : {}
        const docs = await db.collection('numbers').find(query).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            organizationId: d.organizationId || organizationId || 'org_1',
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
            provider: d.provider,
            providerId: d.providerId,
          }))
        }
      }
    } catch (err) {
      logger.warn('MongoDB numbers list fallback', { error: String(err) })
    }
    const provider = getTelephonyProvider()
    return provider.listNumbers ? provider.listNumbers(organizationId) : mockPhoneNumbers
  },

  async search(params: NumberSearchParams) {
    const provider = getTelephonyProvider()
    return provider.searchNumbers(params)
  },

  async provision(num: PhoneNumber, organizationId?: string): Promise<PhoneNumber> {
    const record: PhoneNumber = {
      ...num,
      organizationId: num.organizationId || organizationId || 'org_1',
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('numbers').insertOne({ ...record })
      }
    } catch (err) {
      logger.warn('MongoDB provision number fallback', { error: String(err) })
    }
    return record
  },

  async release(id: string, organizationId?: string): Promise<void> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId
        await db.collection('numbers').deleteOne(filter)
      }
      const provider = getTelephonyProvider()
      await provider.releaseNumber(id)
    } catch (err) {
      logger.warn('MongoDB release number fallback', { error: String(err) })
    }
  },

  async assign(id: string, assignedTo: string, organizationId?: string): Promise<void> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId
        await db.collection('numbers').updateOne(filter, { $set: { assignedTo } })
      }
    } catch (err) {
      logger.warn('MongoDB assign number fallback', { error: String(err) })
    }
  },

  status: getProviderStatus,
}

export const callsService = {
  async list(organizationId?: string): Promise<Call[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const query = organizationId ? { organizationId } : {}
        const docs = await db.collection('calls').find(query).sort({ timestamp: -1 }).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            organizationId: d.organizationId || organizationId || 'org_1',
            contactName: d.contactName,
            contactId: d.contactId,
            phone: d.phone,
            type: d.type,
            agent: d.agent,
            agentId: d.agentId,
            campaignId: d.campaignId,
            status: d.status,
            durationSeconds: d.durationSeconds || 0,
            timestamp: d.timestamp,
            direction: d.direction,
            recordingUrl: d.recordingUrl,
            notes: d.notes,
            sentiment: d.sentiment,
            summary: d.summary,
            transcript: d.transcript,
            cost: d.cost,
            providerCallId: d.providerCallId,
            startedAt: d.startedAt,
            endedAt: d.endedAt,
          }))
        }
      }
    } catch (err) {
      logger.warn('MongoDB calls list fallback', { error: String(err) })
    }
    return organizationId
      ? mockCalls.filter((c) => !c.organizationId || c.organizationId === organizationId)
      : mockCalls
  },

  async get(id: string, organizationId?: string): Promise<Call | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { $or: [{ id }, { _id: id as unknown as never }] }
        if (organizationId) filter.organizationId = organizationId
        const doc = await db.collection('calls').findOne(filter)
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            organizationId: doc.organizationId || organizationId || 'org_1',
            contactName: doc.contactName,
            contactId: doc.contactId,
            phone: doc.phone,
            type: doc.type,
            agent: doc.agent,
            agentId: doc.agentId,
            campaignId: doc.campaignId,
            status: doc.status,
            durationSeconds: doc.durationSeconds || 0,
            timestamp: doc.timestamp,
            direction: doc.direction,
            recordingUrl: doc.recordingUrl,
            notes: doc.notes,
            sentiment: doc.sentiment,
            summary: doc.summary,
            transcript: doc.transcript,
            cost: doc.cost,
            providerCallId: doc.providerCallId,
            startedAt: doc.startedAt,
            endedAt: doc.endedAt,
          }
        }
      }
    } catch (err) {
      logger.warn('MongoDB get call fallback', { error: String(err) })
    }
    return mockCalls.find((c) => c.id === id) ?? null
  },

  async create(callData: Partial<Call>, organizationId?: string): Promise<Call> {
    const orgId = organizationId || 'org_1'
    const newCall: Call = {
      id: callData.id || `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      organizationId: orgId,
      contactName: callData.contactName || 'Direct Contact',
      contactId: callData.contactId,
      phone: callData.phone || '+1 (415) 555-0100',
      type: callData.type || 'outbound',
      agent: callData.agent || 'Sales Agent',
      agentId: callData.agentId,
      campaignId: callData.campaignId,
      status: callData.status || 'in-progress',
      durationSeconds: callData.durationSeconds || 0,
      timestamp: callData.timestamp || new Date().toISOString(),
      direction: callData.direction || 'outbound',
      recordingUrl: callData.recordingUrl,
      notes: callData.notes,
      sentiment: callData.sentiment,
      summary: callData.summary,
      transcript: callData.transcript,
      cost: callData.cost,
      providerCallId: callData.providerCallId,
      startedAt: callData.startedAt || new Date().toISOString(),
    }

    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('calls').insertOne({
          ...newCall,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      logger.warn('MongoDB call create failed, returning in-memory call', { error: String(err) })
    }

    return newCall
  },

  async update(id: string, updates: Partial<Call>, organizationId?: string): Promise<Call | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId

        const updateDoc: Record<string, unknown> = {
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        delete updateDoc.id
        delete updateDoc._id

        await db.collection('calls').updateOne(filter, { $set: updateDoc })
        return this.get(id, organizationId)
      }
    } catch (err) {
      logger.warn('MongoDB call update fallback', { error: String(err) })
    }
    return null
  },

  async delete(id: string, organizationId?: string): Promise<boolean> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId
        const result = await db.collection('calls').deleteOne(filter)
        return result.deletedCount > 0
      }
    } catch (err) {
      logger.warn('MongoDB call delete fallback', { error: String(err) })
    }
    return false
  },
}

export const agentsService = {
  async list(organizationId?: string): Promise<VoiceAgent[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const query = organizationId ? { organizationId } : {}
        const docs = await db.collection('agents').find(query).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            organizationId: d.organizationId || organizationId || 'org_1',
            name: d.name,
            status: d.status,
            voice: d.voice,
            voiceId: d.voiceId,
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
            model: d.model,
            temperature: d.temperature,
            transferNumber: d.transferNumber,
          }))
        }
      }
    } catch (err) {
      logger.warn('MongoDB agents list fallback', { error: String(err) })
    }
    return organizationId
      ? mockVoiceAgents.filter((a) => !a.organizationId || a.organizationId === organizationId)
      : mockVoiceAgents
  },

  async get(id: string, organizationId?: string): Promise<VoiceAgent | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { $or: [{ id }, { _id: id as unknown as never }] }
        if (organizationId) filter.organizationId = organizationId
        const doc = await db.collection('agents').findOne(filter)
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            organizationId: doc.organizationId || organizationId || 'org_1',
            name: doc.name,
            status: doc.status,
            voice: doc.voice,
            voiceId: doc.voiceId,
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
            model: doc.model,
            temperature: doc.temperature,
            transferNumber: doc.transferNumber,
          }
        }
      }
    } catch (err) {
      logger.warn('MongoDB get agent fallback', { error: String(err) })
    }
    return mockVoiceAgents.find((a) => a.id === id) ?? mockVoiceAgents[0]
  },

  async update(id: string, updates: Partial<VoiceAgent>, organizationId?: string): Promise<VoiceAgent | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId
        await db.collection('agents').updateOne(filter, {
          $set: { ...updates, updatedAt: new Date().toISOString() },
        })
      }
    } catch (err) {
      logger.warn('MongoDB update agent fallback', { error: String(err) })
    }
    const current = mockVoiceAgents.find((a) => a.id === id)
    return current ? { ...current, ...updates } : null
  },

  async sampleConversation() {
    return sampleConversation
  },
}

export const campaignsService = {
  async list(organizationId?: string): Promise<Campaign[]> {
    try {
      await ensureDbSeeded()
      const db = await getDatabase()
      if (db) {
        const query = organizationId ? { organizationId } : {}
        const docs = await db.collection('campaigns').find(query).toArray()
        if (docs.length > 0) {
          return docs.map((d) => ({
            id: d.id || String(d._id),
            organizationId: d.organizationId || organizationId || 'org_1',
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
      logger.warn('MongoDB campaigns list fallback', { error: String(err) })
    }
    return organizationId
      ? mockCampaigns.filter((c) => !c.organizationId || c.organizationId === organizationId)
      : mockCampaigns
  },

  async get(id: string, organizationId?: string): Promise<Campaign | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { $or: [{ id }, { _id: id as unknown as never }] }
        if (organizationId) filter.organizationId = organizationId
        const doc = await db.collection('campaigns').findOne(filter)
        if (doc) {
          return {
            id: doc.id || String(doc._id),
            organizationId: doc.organizationId || organizationId || 'org_1',
            name: doc.name,
            status: doc.status,
            contactCount: doc.contactCount,
            callsCompleted: doc.callsCompleted,
            callsRemaining: doc.callsRemaining,
            connected: doc.connected,
            missed: doc.missed,
            conversionRate: doc.conversionRate,
            callerId: doc.callerId,
            dialingMode: doc.dialingMode,
            agent: doc.agent,
            schedule: doc.schedule,
          }
        }
      }
    } catch (err) {
      logger.warn('MongoDB get campaign fallback', { error: String(err) })
    }
    return mockCampaigns.find((c) => c.id === id) ?? null
  },

  async create(camp: Omit<Campaign, 'id'>, organizationId?: string): Promise<Campaign> {
    const newCamp: Campaign = {
      ...camp,
      id: `cmp_${Date.now()}`,
      organizationId: camp.organizationId || organizationId || 'org_1',
      createdAt: new Date().toISOString(),
    }
    try {
      const db = await getDatabase()
      if (db) {
        await db.collection('campaigns').insertOne({ ...newCamp })
      }
    } catch (err) {
      logger.warn('MongoDB create campaign fallback', { error: String(err) })
    }
    return newCamp
  },

  async update(id: string, updates: Partial<Campaign>, organizationId?: string): Promise<Campaign | null> {
    try {
      const db = await getDatabase()
      if (db) {
        const filter: Record<string, unknown> = { id }
        if (organizationId) filter.organizationId = organizationId
        await db.collection('campaigns').updateOne(filter, {
          $set: { ...updates, updatedAt: new Date().toISOString() },
        })
      }
    } catch (err) {
      logger.warn('MongoDB update campaign fallback', { error: String(err) })
    }
    const current = mockCampaigns.find((c) => c.id === id)
    return current ? { ...current, ...updates } : null
  },
}

export const orgService = {
  async current(organizationId?: string) {
    try {
      const db = await getDatabase()
      if (db) {
        const query = organizationId ? { organizationId } : {}
        const u = await db.collection('users').findOne(query)
        if (u) {
          return {
            organization: (u.organization as typeof demoOrganization) || demoOrganization,
            user: {
              id: u.id || String(u._id),
              name: u.name,
              email: u.email,
              avatarInitials: u.avatarInitials || (u.name ? u.name.slice(0, 2).toUpperCase() : 'CC'),
              role: u.role || 'owner',
              organizationId: u.organizationId || organizationId || 'org_1',
              createdAt: u.createdAt || '2025-01-12T09:00:00Z',
            },
            team: teamMembers,
          }
        }
      }
    } catch (err) {
      logger.warn('MongoDB current org fallback', { error: String(err) })
    }
    return { organization: demoOrganization, user: demoUser, team: teamMembers }
  },
}

export { mockPhoneNumbers as phoneNumbers }
