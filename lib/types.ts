// Core domain types for Centennial Connect.
// These mirror the intended PostgreSQL entities so the mock layer can be
// swapped for a real repository without changing the UI.

export type ID = string

export interface User {
  id: ID
  name: string
  email: string
  avatarInitials?: string
  role: OrgRole
  organizationId: ID
  createdAt: string
}

export type OrgRole = 'owner' | 'admin' | 'agent' | 'viewer'

export interface Organization {
  id: ID
  name: string
  plan: 'starter' | 'growth' | 'scale' | 'enterprise'
  createdAt: string
}

export interface TeamMember {
  id: ID
  name: string
  email: string
  role: OrgRole
  status: 'active' | 'invited' | 'suspended'
  lastActive: string
}

export type ContactStatus = 'lead' | 'active' | 'customer' | 'do-not-call' | 'inactive'

export interface Contact {
  id: ID
  name: string
  company: string
  phone: string
  email: string
  status: ContactStatus
  tags: string[]
  lastContacted: string | null
  notes?: string
}

export type NumberType = 'local' | 'toll-free' | 'mobile'
export type NumberStatus = 'active' | 'available' | 'porting' | 'suspended'

export interface PhoneNumber {
  id: ID
  e164: string
  formatted: string
  country: string
  countryCode: string
  region: string
  type: NumberType
  status: NumberStatus
  monthlyPrice: number
  assignedTo?: string
  capabilities: Array<'voice' | 'sms'>
}

export type CallType = 'inbound' | 'outbound' | 'ai'
export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'failed' | 'in-progress'

export interface Call {
  id: ID
  contactName: string
  contactId?: ID
  phone: string
  type: CallType
  agent: string
  status: CallStatus
  durationSeconds: number
  timestamp: string
  direction: 'in' | 'out'
  recordingUrl?: string
  notes?: string
}

export type AgentStatus = 'active' | 'paused' | 'offline'

export interface VoiceAgent {
  id: ID
  name: string
  status: AgentStatus
  voice: string
  language: string
  phoneNumber: string
  greeting: string
  instructions: string
  objective: string
  businessContext: string
  workingHours: string
  callVolume: number
  successRate: number
  avgDurationSeconds: number
}

export interface ConversationTurn {
  speaker: 'agent' | 'customer'
  text: string
}

export type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed'

export interface Campaign {
  id: ID
  name: string
  status: CampaignStatus
  contactCount: number
  callsCompleted: number
  callsRemaining: number
  connected: number
  missed: number
  conversionRate: number
  callerId: string
  dialingMode: 'preview' | 'progressive' | 'predictive'
  agent: string
  schedule: string
}

export interface UsageRecord {
  product: 'virtual-numbers' | 'voice-agent' | 'power-dialer'
  label: string
  used: number
  limit: number
  unit: string
}

export interface ActivityLogEntry {
  id: ID
  time: string
  contact: string
  type: CallType
  status: CallStatus
  duration: string
}

export interface TimeSeriesPoint {
  label: string
  value: number
  secondary?: number
}

export interface StatCard {
  label: string
  value: number
  suffix?: string
  prefix?: string
  delta: number
  trend: 'up' | 'down'
}
