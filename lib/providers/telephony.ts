import type { Call, PhoneNumber, TelephonyProviderType, TelephonyWebhookPayload } from '@/lib/types'

export interface NumberSearchParams {
  countryCode: string
  region?: string
  areaCode?: string
  type?: PhoneNumber['type']
  limit?: number
}

export interface PurchaseNumberParams {
  numberId: string
  phoneNumber?: string
  organizationId?: string
  friendlyName?: string
}

export interface PlaceCallParams {
  from: string
  to: string
  organizationId?: string
  agentId?: string
  contactId?: string
  campaignId?: string
  webhookUrl?: string
}

export interface GenerateTokenParams {
  identity: string
  organizationId: string
  agentId?: string
}

export interface WebRTCTokenResult {
  token: string
  identity: string
  expiresAt: string
  provider: TelephonyProviderType
}

export interface ProviderStatus {
  configured: boolean
  providerName: TelephonyProviderType
  details?: string
}

/**
 * Unified Telephony Provider Interface.
 * Implemented by MockProvider, TwilioProvider, and TelnyxProvider.
 */
export interface ITelephonyProvider {
  readonly providerName: TelephonyProviderType

  // Number management
  searchNumbers(params: NumberSearchParams): Promise<PhoneNumber[]>
  purchaseNumber(params: PurchaseNumberParams): Promise<PhoneNumber>
  releaseNumber(numberId: string): Promise<void>
  listNumbers?(organizationId?: string): Promise<PhoneNumber[]>

  // Call control
  placeCall(params: PlaceCallParams): Promise<{ callId: string; providerCallId: string }>
  endCall(callId: string): Promise<void>
  listCalls?(organizationId?: string): Promise<Call[]>

  // WebRTC Client Token generation for browser calling
  generateWebRTCToken(params: GenerateTokenParams): Promise<WebRTCTokenResult>

  // Webhook validation & parsing
  verifyWebhook(
    headers: Headers,
    rawBody: string,
    url?: string
  ): Promise<{ isValid: boolean; event?: TelephonyWebhookPayload; error?: string }>

  // Status
  getStatus(): ProviderStatus
}

// Backward compatibility interfaces matching the original prototype
export interface NumberProvider {
  search(params: NumberSearchParams): Promise<PhoneNumber[]>
  purchase(numberId: string): Promise<PhoneNumber>
  list(): Promise<PhoneNumber[]>
  release(numberId: string): Promise<void>
}

export interface TelephonyProvider {
  placeCall(from: string, to: string): Promise<{ callId: string }>
  placeCall(params: PlaceCallParams): Promise<{ callId: string; providerCallId: string }>
  endCall(callId: string): Promise<void>
  listCalls(): Promise<Call[]>
}

export interface VoiceProvider {
  startAgentCall(agentId: string, to: string): Promise<{ callId: string }>
  availableVoices(): Promise<string[]>
}

/**
 * Reports whether real telephony provider credentials are configured in environment.
 */
export function getProviderStatus(): ProviderStatus {
  const provider = (process.env.TELEPHONY_PROVIDER as TelephonyProviderType) || 'mock'
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  )
  const hasTelnyx = Boolean(process.env.TELNYX_API_KEY)

  let configured = false
  if (provider === 'twilio') configured = hasTwilio
  else if (provider === 'telnyx') configured = hasTelnyx
  else configured = false

  return {
    configured,
    providerName: provider,
    details: configured
      ? `Using live ${provider.toUpperCase()} telephony provider.`
      : `Running in mock/simulated telephony mode. Configure ${provider.toUpperCase()} credentials in .env to activate live calling.`,
  }
}
