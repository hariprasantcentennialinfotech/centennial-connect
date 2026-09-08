import type { Call, PhoneNumber } from '@/lib/types'

// Provider abstraction interfaces.
// A real telephony vendor (Twilio, Telnyx, Plivo, etc.) can implement these
// without touching UI or service code. Until credentials are configured, the
// mock implementation below is used.

export interface NumberSearchParams {
  countryCode: string
  region?: string
  type?: PhoneNumber['type']
}

export interface NumberProvider {
  search(params: NumberSearchParams): Promise<PhoneNumber[]>
  purchase(numberId: string): Promise<PhoneNumber>
  list(): Promise<PhoneNumber[]>
  release(numberId: string): Promise<void>
}

export interface TelephonyProvider {
  placeCall(from: string, to: string): Promise<{ callId: string }>
  endCall(callId: string): Promise<void>
  listCalls(): Promise<Call[]>
}

export interface VoiceProvider {
  startAgentCall(agentId: string, to: string): Promise<{ callId: string }>
  availableVoices(): Promise<string[]>
}

export interface ProviderStatus {
  configured: boolean
  providerName: string
}

/**
 * Reports whether real provider credentials are present. The UI uses this to
 * clearly label data as demo/mock rather than pretending calls are live.
 */
export function getProviderStatus(): ProviderStatus {
  const configured = Boolean(
    process.env.TELEPHONY_API_KEY && process.env.TELEPHONY_API_SECRET,
  )
  return {
    configured,
    providerName: process.env.TELEPHONY_PROVIDER ?? 'mock',
  }
}
