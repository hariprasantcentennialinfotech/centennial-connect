import type {
  ActivityLogEntry,
  Call,
  Campaign,
  Contact,
  ConversationTurn,
  Organization,
  PhoneNumber,
  StatCard,
  TeamMember,
  TimeSeriesPoint,
  UsageRecord,
  User,
  VoiceAgent,
} from './types'

export const demoOrganization: Organization = {
  id: 'org_1',
  name: 'Northwind Sales Co.',
  plan: 'growth',
  createdAt: '2025-01-12T09:00:00Z',
}

export const demoUser: User = {
  id: 'usr_1',
  name: 'Alex Morgan',
  email: 'alex@northwind.co',
  avatarInitials: 'AM',
  role: 'owner',
  organizationId: 'org_1',
  createdAt: '2025-01-12T09:00:00Z',
}

export const teamMembers: TeamMember[] = [
  { id: 'tm_1', name: 'Alex Morgan', email: 'alex@northwind.co', role: 'owner', status: 'active', lastActive: '2026-09-08T08:10:00Z' },
  { id: 'tm_2', name: 'Priya Nair', email: 'priya@northwind.co', role: 'admin', status: 'active', lastActive: '2026-09-08T07:40:00Z' },
  { id: 'tm_3', name: 'Diego Fernández', email: 'diego@northwind.co', role: 'agent', status: 'active', lastActive: '2026-09-07T18:22:00Z' },
  { id: 'tm_4', name: 'Sara Ahmed', email: 'sara@northwind.co', role: 'agent', status: 'active', lastActive: '2026-09-08T06:55:00Z' },
  { id: 'tm_5', name: 'Tom Becker', email: 'tom@northwind.co', role: 'viewer', status: 'invited', lastActive: '—' },
]

export const contacts: Contact[] = [
  { id: 'c_1', name: 'Jordan Lee', company: 'Brightpath Media', phone: '+1 (415) 555-0182', email: 'jordan@brightpath.io', status: 'customer', tags: ['enterprise', 'renewal'], lastContacted: '2026-09-07T15:20:00Z', notes: 'Interested in the AI voice agent add-on for Q4.' },
  { id: 'c_2', name: 'Mei Lin', company: 'Cascade Retail', phone: '+1 (206) 555-0148', email: 'mei@cascaderetail.com', status: 'active', tags: ['smb'], lastContacted: '2026-09-06T11:05:00Z' },
  { id: 'c_3', name: 'Oliver Grant', company: 'Halcyon Group', phone: '+44 20 7946 0321', email: 'oliver@halcyon.co.uk', status: 'lead', tags: ['inbound'], lastContacted: '2026-09-05T09:30:00Z' },
  { id: 'c_4', name: 'Fatima Zahra', company: 'Nova Logistics', phone: '+1 (312) 555-0199', email: 'fatima@novalogistics.com', status: 'active', tags: ['mid-market'], lastContacted: '2026-09-04T14:00:00Z' },
  { id: 'c_5', name: 'Lucas Silva', company: 'Vertex Fintech', phone: '+55 11 4002-8922', email: 'lucas@vertex.fin', status: 'lead', tags: ['demo-scheduled'], lastContacted: '2026-09-03T16:45:00Z' },
  { id: 'c_6', name: 'Hannah Weber', company: 'Kettle & Co.', phone: '+49 30 901820', email: 'hannah@kettle.de', status: 'customer', tags: ['upsell'], lastContacted: '2026-09-02T10:15:00Z' },
  { id: 'c_7', name: 'Noah Kim', company: 'Summit Analytics', phone: '+1 (646) 555-0170', email: 'noah@summit.ai', status: 'inactive', tags: ['churn-risk'], lastContacted: '2026-08-20T13:00:00Z' },
  { id: 'c_8', name: 'Aria Rossi', company: 'Lumen Design', phone: '+39 06 6982 1122', email: 'aria@lumen.design', status: 'do-not-call', tags: [], lastContacted: '2026-07-30T09:00:00Z' },
  { id: 'c_9', name: 'Ethan Clarke', company: 'Bluewave SaaS', phone: '+1 (503) 555-0110', email: 'ethan@bluewave.app', status: 'active', tags: ['pilot'], lastContacted: '2026-09-08T07:12:00Z' },
  { id: 'c_10', name: 'Sofia Marín', company: 'Andes Travel', phone: '+34 91 123 4567', email: 'sofia@andes.travel', status: 'lead', tags: ['inbound', 'urgent'], lastContacted: null },
]

export const phoneNumbers: PhoneNumber[] = [
  { id: 'pn_1', e164: '+14155550100', formatted: '+1 (415) 555-0100', country: 'United States', countryCode: 'US', region: 'San Francisco, CA', type: 'local', status: 'active', monthlyPrice: 3, assignedTo: 'Sales Team', capabilities: ['voice', 'sms'] },
  { id: 'pn_2', e164: '+18005550111', formatted: '+1 (800) 555-0111', country: 'United States', countryCode: 'US', region: 'Toll-Free', type: 'toll-free', status: 'active', monthlyPrice: 5, assignedTo: 'Support Line', capabilities: ['voice'] },
  { id: 'pn_3', e164: '+442079460000', formatted: '+44 20 7946 0000', country: 'United Kingdom', countryCode: 'GB', region: 'London', type: 'local', status: 'active', monthlyPrice: 4, assignedTo: 'EMEA Team', capabilities: ['voice', 'sms'] },
  { id: 'pn_4', e164: '+61285550123', formatted: '+61 2 8555 0123', country: 'Australia', countryCode: 'AU', region: 'Sydney', type: 'local', status: 'porting', monthlyPrice: 4, capabilities: ['voice'] },
]

export const searchableNumbers: PhoneNumber[] = [
  { id: 'sn_1', e164: '+14155550182', formatted: '+1 (415) 555-0182', country: 'United States', countryCode: 'US', region: 'San Francisco, CA', type: 'local', status: 'available', monthlyPrice: 3, capabilities: ['voice', 'sms'] },
  { id: 'sn_2', e164: '+14155550205', formatted: '+1 (415) 555-0205', country: 'United States', countryCode: 'US', region: 'San Francisco, CA', type: 'local', status: 'available', monthlyPrice: 3, capabilities: ['voice', 'sms'] },
  { id: 'sn_3', e164: '+442079460321', formatted: '+44 20 7946 0321', country: 'United Kingdom', countryCode: 'GB', region: 'London', type: 'local', status: 'available', monthlyPrice: 4, capabilities: ['voice', 'sms'] },
  { id: 'sn_4', e164: '+18005550234', formatted: '+1 (800) 555-0234', country: 'United States', countryCode: 'US', region: 'Toll-Free', type: 'toll-free', status: 'available', monthlyPrice: 5, capabilities: ['voice'] },
  { id: 'sn_5', e164: '+14155550266', formatted: '+1 (415) 555-0266', country: 'United States', countryCode: 'US', region: 'San Francisco, CA', type: 'local', status: 'available', monthlyPrice: 3, capabilities: ['voice'] },
]

export const calls: Call[] = [
  { id: 'call_1', contactName: 'Jordan Lee', contactId: 'c_1', phone: '+1 (415) 555-0182', type: 'outbound', agent: 'Diego Fernández', status: 'completed', durationSeconds: 412, timestamp: '2026-09-08T08:02:00Z', direction: 'out', notes: 'Confirmed renewal, sending updated quote.' },
  { id: 'call_2', contactName: 'Mei Lin', contactId: 'c_2', phone: '+1 (206) 555-0148', type: 'ai', agent: 'Aria (AI)', status: 'completed', durationSeconds: 186, timestamp: '2026-09-08T07:48:00Z', direction: 'out' },
  { id: 'call_3', contactName: 'Oliver Grant', contactId: 'c_3', phone: '+44 20 7946 0321', type: 'inbound', agent: 'Sara Ahmed', status: 'completed', durationSeconds: 322, timestamp: '2026-09-08T07:30:00Z', direction: 'in' },
  { id: 'call_4', contactName: 'Unknown', phone: '+1 (312) 555-0143', type: 'inbound', agent: '—', status: 'missed', durationSeconds: 0, timestamp: '2026-09-08T07:12:00Z', direction: 'in' },
  { id: 'call_5', contactName: 'Fatima Zahra', contactId: 'c_4', phone: '+1 (312) 555-0199', type: 'outbound', agent: 'Priya Nair', status: 'voicemail', durationSeconds: 34, timestamp: '2026-09-08T06:59:00Z', direction: 'out' },
  { id: 'call_6', contactName: 'Lucas Silva', contactId: 'c_5', phone: '+55 11 4002-8922', type: 'ai', agent: 'Aria (AI)', status: 'completed', durationSeconds: 254, timestamp: '2026-09-08T06:41:00Z', direction: 'out' },
  { id: 'call_7', contactName: 'Hannah Weber', contactId: 'c_6', phone: '+49 30 901820', type: 'outbound', agent: 'Diego Fernández', status: 'completed', durationSeconds: 508, timestamp: '2026-09-07T18:20:00Z', direction: 'out' },
  { id: 'call_8', contactName: 'Noah Kim', contactId: 'c_7', phone: '+1 (646) 555-0170', type: 'outbound', agent: 'Sara Ahmed', status: 'failed', durationSeconds: 0, timestamp: '2026-09-07T17:55:00Z', direction: 'out' },
  { id: 'call_9', contactName: 'Ethan Clarke', contactId: 'c_9', phone: '+1 (503) 555-0110', type: 'inbound', agent: 'Aria (AI)', status: 'completed', durationSeconds: 143, timestamp: '2026-09-07T16:30:00Z', direction: 'in' },
  { id: 'call_10', contactName: 'Sofia Marín', contactId: 'c_10', phone: '+34 91 123 4567', type: 'ai', agent: 'Aria (AI)', status: 'completed', durationSeconds: 201, timestamp: '2026-09-07T15:10:00Z', direction: 'out' },
]

export const voiceAgents: VoiceAgent[] = [
  {
    id: 'va_1',
    name: 'Aria — Inbound Concierge',
    status: 'active',
    voice: 'Aria (Warm, Female)',
    language: 'English (US)',
    phoneNumber: '+1 (800) 555-0111',
    greeting: 'Hi, thanks for calling Northwind. This is Aria — how can I help you today?',
    instructions:
      'Greet callers warmly, identify their intent, answer common product questions, and book demos. Escalate billing disputes and enterprise deals to a human agent.',
    objective: 'Qualify inbound interest and book product demos',
    businessContext:
      'Northwind sells cloud communications software to SMB and mid-market sales teams. Core plans: Starter, Growth, Scale.',
    workingHours: 'Mon–Fri, 8:00 AM – 6:00 PM PT',
    callVolume: 1284,
    successRate: 87,
    avgDurationSeconds: 168,
  },
]

export const sampleConversation: ConversationTurn[] = [
  { speaker: 'agent', text: 'Hi, thanks for calling Northwind. This is Aria — how can I help you today?' },
  { speaker: 'customer', text: 'Hi, I saw your power dialer online and wanted to understand the pricing.' },
  { speaker: 'agent', text: 'Happy to help! Power Dialer is included on our Growth plan. How many agents are on your team?' },
  { speaker: 'customer', text: 'We have about eight sales reps right now.' },
  { speaker: 'agent', text: 'Perfect — the Growth plan fits teams up to twelve seats. Would you like me to book a 20-minute demo this week?' },
  { speaker: 'customer', text: 'Yes, Thursday afternoon works.' },
  { speaker: 'agent', text: 'Great, I have you down for Thursday at 2 PM. You will receive a confirmation email shortly.' },
]

export const campaigns: Campaign[] = [
  { id: 'cmp_1', name: 'Q3 Renewals Outreach', status: 'active', contactCount: 240, callsCompleted: 168, callsRemaining: 72, connected: 96, missed: 41, conversionRate: 34, callerId: '+1 (415) 555-0100', dialingMode: 'progressive', agent: 'Diego Fernández', schedule: 'Mon–Fri, 9 AM – 5 PM PT' },
  { id: 'cmp_2', name: 'Inbound Lead Follow-up', status: 'active', contactCount: 130, callsCompleted: 54, callsRemaining: 76, connected: 33, missed: 12, conversionRate: 41, callerId: '+1 (800) 555-0111', dialingMode: 'preview', agent: 'Sara Ahmed', schedule: 'Mon–Fri, 8 AM – 6 PM PT' },
  { id: 'cmp_3', name: 'EMEA Expansion', status: 'paused', contactCount: 96, callsCompleted: 21, callsRemaining: 75, connected: 14, missed: 5, conversionRate: 29, callerId: '+44 20 7946 0000', dialingMode: 'progressive', agent: 'Priya Nair', schedule: 'Mon–Fri, 9 AM – 5 PM GMT' },
]

export const dialerContacts = contacts.slice(0, 6).map((c, i) => ({
  ...c,
  callState: (['queued', 'queued', 'in-progress', 'connected', 'no-answer', 'queued'] as const)[i],
}))

export const usageRecords: UsageRecord[] = [
  { product: 'virtual-numbers', label: 'Active numbers', used: 4, limit: 25, unit: 'numbers' },
  { product: 'voice-agent', label: 'AI minutes', used: 3600, limit: 10000, unit: 'min' },
  { product: 'power-dialer', label: 'Dialer minutes', used: 8420, limit: 20000, unit: 'min' },
]

export const dashboardStats: StatCard[] = [
  { label: 'Total Calls', value: 3482, delta: 12.4, trend: 'up' },
  { label: 'Connected Calls', value: 2189, delta: 8.1, trend: 'up' },
  { label: 'AI Calls', value: 964, delta: 22.5, trend: 'up' },
  { label: 'Outbound Calls', value: 1876, delta: 3.2, trend: 'up' },
  { label: 'Call Minutes', value: 12040, suffix: ' min', delta: 5.6, trend: 'up' },
  { label: 'Active Numbers', value: 4, delta: 0, trend: 'up' },
]

export const callVolumeSeries: TimeSeriesPoint[] = [
  { label: 'Mon', value: 420, secondary: 280 },
  { label: 'Tue', value: 512, secondary: 341 },
  { label: 'Wed', value: 488, secondary: 322 },
  { label: 'Thu', value: 604, secondary: 402 },
  { label: 'Fri', value: 566, secondary: 380 },
  { label: 'Sat', value: 214, secondary: 120 },
  { label: 'Sun', value: 168, secondary: 96 },
]

export const successRateSeries: TimeSeriesPoint[] = [
  { label: 'Wk 1', value: 61 },
  { label: 'Wk 2', value: 64 },
  { label: 'Wk 3', value: 68 },
  { label: 'Wk 4', value: 72 },
  { label: 'Wk 5', value: 70 },
  { label: 'Wk 6', value: 76 },
]

export const durationSeries: TimeSeriesPoint[] = [
  { label: 'Mon', value: 182 },
  { label: 'Tue', value: 201 },
  { label: 'Wed', value: 176 },
  { label: 'Thu', value: 220 },
  { label: 'Fri', value: 198 },
  { label: 'Sat', value: 150 },
  { label: 'Sun', value: 142 },
]

export const usageByProduct: TimeSeriesPoint[] = [
  { label: 'Virtual Numbers', value: 34 },
  { label: 'AI Voice Agent', value: 28 },
  { label: 'Power Dialer', value: 38 },
]

export const aiVsHumanSeries: TimeSeriesPoint[] = [
  { label: 'Mon', value: 280, secondary: 140 },
  { label: 'Tue', value: 320, secondary: 192 },
  { label: 'Wed', value: 300, secondary: 188 },
  { label: 'Thu', value: 360, secondary: 244 },
  { label: 'Fri', value: 340, secondary: 226 },
  { label: 'Sat', value: 120, secondary: 94 },
  { label: 'Sun', value: 96, secondary: 72 },
]

export const activityLog: ActivityLogEntry[] = calls.slice(0, 6).map((c) => ({
  id: c.id,
  time: c.timestamp,
  contact: c.contactName,
  type: c.type,
  status: c.status,
  duration: c.durationSeconds > 0 ? `${Math.floor(c.durationSeconds / 60)}:${String(c.durationSeconds % 60).padStart(2, '0')}` : '—',
}))

export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
]
