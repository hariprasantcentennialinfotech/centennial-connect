// Core domain types for Centennial Connect Production Architecture.
// Supports complete multi-tenancy, real telephony integrations, WebRTC, and AI agents.

export type ID = string

export type OrgRole = 'owner' | 'admin' | 'agent' | 'viewer'

export interface User {
  id: ID
  name: string
  email: string
  avatarUrl?: string
  avatarInitials?: string
  role: OrgRole
  organizationId: ID
  passwordHash?: string
  googleId?: string
  emailVerified?: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
}

export interface Organization {
  id: ID
  name: string
  slug?: string
  plan: 'starter' | 'growth' | 'scale' | 'enterprise'
  status?: 'active' | 'trialing' | 'past_due' | 'canceled'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  updatedAt?: string
}

export interface TeamMember {
  id: ID
  organizationId?: ID
  name: string
  email: string
  role: OrgRole
  status: 'active' | 'invited' | 'suspended'
  lastActive: string
}

export type ContactStatus = 'lead' | 'active' | 'customer' | 'do-not-call' | 'inactive' | 'contacted' | 'qualified'

export interface Contact {
  id: ID
  organizationId?: ID
  name: string
  firstName?: string
  lastName?: string
  company: string
  phone: string
  email: string
  status: ContactStatus
  tags: string[]
  lastContacted: string | null
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type NumberType = 'local' | 'toll-free' | 'mobile'
export type NumberStatus = 'active' | 'available' | 'porting' | 'suspended' | 'released' | 'pending'
export type TelephonyProviderType = 'mock' | 'twilio' | 'telnyx'

export interface PhoneNumber {
  id: ID
  organizationId?: ID
  e164: string
  formatted: string
  country: string
  countryCode: string
  region: string
  type: NumberType
  status: NumberStatus
  monthlyPrice: number
  assignedTo?: string
  assignedAgentId?: string
  capabilities: Array<'voice' | 'sms'>
  provider?: TelephonyProviderType
  providerId?: string
  friendlyName?: string
  createdAt?: string
}

export type CallType = 'inbound' | 'outbound' | 'ai'
export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'failed' | 'in-progress' | 'queued' | 'ringing' | 'busy' | 'no-answer'
export type CallSentiment = 'positive' | 'neutral' | 'negative'

export interface TranscriptTurn {
  speaker: 'agent' | 'customer' | 'system'
  text: string
  timestamp?: string
}

export interface Call {
  id: ID
  organizationId?: ID
  contactName: string
  contactId?: ID
  phone: string
  type: CallType
  agent: string
  agentId?: ID
  campaignId?: ID
  status: CallStatus
  durationSeconds: number
  timestamp: string
  direction: 'in' | 'out' | 'inbound' | 'outbound'
  recordingUrl?: string
  transcript?: TranscriptTurn[]
  sentiment?: CallSentiment
  summary?: string
  cost?: number
  notes?: string
  providerCallId?: string
  startedAt?: string
  endedAt?: string
}

export type AgentStatus = 'active' | 'paused' | 'offline'

export interface VoiceAgent {
  id: ID
  organizationId?: ID
  name: string
  status: AgentStatus
  voice: string
  voiceId?: string
  language: string
  phoneNumber: string
  phoneNumberId?: ID
  greeting: string
  instructions: string
  objective: string
  businessContext: string
  workingHours: string
  callVolume: number
  successRate: number
  avgDurationSeconds: number
  model?: string
  temperature?: number
  maxCallDurationSeconds?: number
  transferNumber?: string
  webhookUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface ConversationTurn {
  speaker: 'agent' | 'customer' | 'system'
  text: string
  timestamp?: string
}

export type CampaignStatus = 'active' | 'paused' | 'draft' | 'completed'
export type DialingMode = 'preview' | 'progressive' | 'predictive'

export interface Campaign {
  id: ID
  organizationId?: ID
  name: string
  status: CampaignStatus
  contactCount: number
  callsCompleted: number
  callsRemaining: number
  connected: number
  missed: number
  conversionRate: number
  callerId: string
  callerNumberId?: ID
  dialingMode: DialingMode
  agent: string
  agentId?: ID
  schedule: string
  contactListIds?: string[]
  createdAt?: string
  updatedAt?: string
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
  organizationId?: ID
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

// -----------------------------------------------------------------------------
// WebRTC & Realtime Telephony Protocol Types
// -----------------------------------------------------------------------------

export type WebRTCCallState =
  | 'idle'
  | 'connecting'
  | 'ringing'
  | 'connected'
  | 'muted'
  | 'holding'
  | 'disconnected'
  | 'failed'

export interface WebRTCSessionPayload {
  sessionId: string
  callId?: string
  organizationId: string
  direction: 'inbound' | 'outbound'
  fromNumber: string
  toNumber: string
  contactName?: string
  token: string
  provider: TelephonyProviderType
}

export interface TelephonyWebhookPayload {
  provider: TelephonyProviderType
  event: 'call.initiated' | 'call.ringing' | 'call.answered' | 'call.completed' | 'call.recording.ready'
  callId: string
  from: string
  to: string
  durationSeconds?: number
  recordingUrl?: string
  rawPayload?: Record<string, unknown>
}
