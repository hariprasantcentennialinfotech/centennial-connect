// Service layer. Each function is the single seam the UI calls through.
// Today they return mock data; swap the bodies for real repository/provider
// calls later without changing any component.

import {
  activityLog,
  aiVsHumanSeries,
  callVolumeSeries,
  calls,
  campaigns,
  contacts,
  dashboardStats,
  demoOrganization,
  demoUser,
  durationSeries,
  phoneNumbers,
  sampleConversation,
  successRateSeries,
  teamMembers,
  usageByProduct,
  usageRecords,
  voiceAgents,
} from '@/lib/mock-data'
import { mockNumberProvider } from '@/lib/providers/mock-provider'
import { getProviderStatus, type NumberSearchParams } from '@/lib/providers/telephony'

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
  async list() {
    return contacts
  },
  async get(id: string) {
    return contacts.find((c) => c.id === id) ?? null
  },
}

export const numbersService = {
  async list() {
    return mockNumberProvider.list()
  },
  async search(params: NumberSearchParams) {
    return mockNumberProvider.search(params)
  },
  status: getProviderStatus,
}

export const callsService = {
  async list() {
    return calls
  },
  async get(id: string) {
    return calls.find((c) => c.id === id) ?? null
  },
}

export const agentsService = {
  async list() {
    return voiceAgents
  },
  async get(id: string) {
    return voiceAgents.find((a) => a.id === id) ?? voiceAgents[0]
  },
  async sampleConversation() {
    return sampleConversation
  },
}

export const campaignsService = {
  async list() {
    return campaigns
  },
}

export const orgService = {
  async current() {
    return { organization: demoOrganization, user: demoUser, team: teamMembers }
  },
}

export { phoneNumbers }
