import { calls, phoneNumbers, searchableNumbers } from '@/lib/mock-data'
import type { Call, PhoneNumber, TelephonyWebhookPayload } from '@/lib/types'
import { SignJWT } from 'jose'
import { env } from '@/lib/config/env'
import type {
  ITelephonyProvider,
  NumberSearchParams,
  PurchaseNumberParams,
  PlaceCallParams,
  GenerateTokenParams,
  WebRTCTokenResult,
  ProviderStatus,
  NumberProvider,
  TelephonyProvider,
  VoiceProvider,
} from './telephony'

export class MockTelephonyProviderClass implements ITelephonyProvider, NumberProvider, TelephonyProvider, VoiceProvider {
  readonly providerName = 'mock' as const

  // ---------------------------------------------------------------------------
  // ITelephonyProvider Implementation
  // ---------------------------------------------------------------------------

  async searchNumbers(params: NumberSearchParams): Promise<PhoneNumber[]> {
    return searchableNumbers.filter((n) => {
      if (params.countryCode && n.countryCode !== params.countryCode) return false
      if (params.type && n.type !== params.type) return false
      return true
    })
  }

  async purchaseNumber(params: PurchaseNumberParams): Promise<PhoneNumber> {
    const found = searchableNumbers.find((n) => n.id === params.numberId || n.e164 === params.phoneNumber)
    if (!found) throw new Error('Number not available in catalog.')
    return {
      ...found,
      organizationId: params.organizationId || 'org_1',
      status: 'active',
      friendlyName: params.friendlyName || found.formatted,
      createdAt: new Date().toISOString(),
    }
  }

  async releaseNumber(_numberId: string): Promise<void> {
    return Promise.resolve()
  }

  async listNumbers(organizationId?: string): Promise<PhoneNumber[]> {
    if (!organizationId) return phoneNumbers
    return phoneNumbers.filter((n) => !n.organizationId || n.organizationId === organizationId)
  }

  async placeCall(from: string, to: string): Promise<{ callId: string }>
  async placeCall(params: PlaceCallParams): Promise<{ callId: string; providerCallId: string }>
  async placeCall(
    paramsOrFrom: PlaceCallParams | string,
    _maybeTo?: string
  ): Promise<{ callId: string; providerCallId: string }> {
    const callId = `call_${Date.now()}`
    const providerCallId = `mock_p_${Date.now()}`
    return { callId, providerCallId }
  }

  async endCall(_callId: string): Promise<void> {
    return Promise.resolve()
  }

  async listCalls(organizationId?: string): Promise<Call[]> {
    if (!organizationId) return calls
    return calls.filter((c) => !c.organizationId || c.organizationId === organizationId)
  }

  async generateWebRTCToken(params: GenerateTokenParams): Promise<WebRTCTokenResult> {
    const secretKey = new TextEncoder().encode(env.SESSION_SECRET)
    const token = await new SignJWT({
      sub: params.identity,
      org: params.organizationId,
      agentId: params.agentId,
      provider: 'mock',
      role: 'caller',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secretKey)

    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString()
    return {
      token,
      identity: params.identity,
      expiresAt,
      provider: 'mock',
    }
  }

  async verifyWebhook(
    headers: Headers,
    rawBody: string
  ): Promise<{ isValid: boolean; event?: TelephonyWebhookPayload; error?: string }> {
    try {
      if (!rawBody) return { isValid: false, error: 'Empty webhook body' }
      const payload = JSON.parse(rawBody)
      return {
        isValid: true,
        event: {
          provider: 'mock',
          event: payload.event || 'call.completed',
          callId: payload.callId || `mock_call_${Date.now()}`,
          from: payload.from || '+18005550111',
          to: payload.to || '+14155550100',
          durationSeconds: payload.durationSeconds ?? 60,
          recordingUrl: payload.recordingUrl,
          rawPayload: payload,
        },
      }
    } catch (err) {
      return { isValid: false, error: String(err) }
    }
  }

  getStatus(): ProviderStatus {
    return {
      configured: false,
      providerName: 'mock',
      details: 'Mock provider active. Simulated calling and number provisioning.',
    }
  }

  // ---------------------------------------------------------------------------
  // Backward compatibility methods for existing prototype code
  // ---------------------------------------------------------------------------

  async search(params: NumberSearchParams): Promise<PhoneNumber[]> {
    return this.searchNumbers(params)
  }

  async purchase(numberId: string): Promise<PhoneNumber> {
    return this.purchaseNumber({ numberId })
  }

  async list(): Promise<PhoneNumber[]> {
    return this.listNumbers()
  }

  async release(numberId: string): Promise<void> {
    return this.releaseNumber(numberId)
  }

  async startAgentCall(_agentId: string, _to: string): Promise<{ callId: string }> {
    return { callId: `mock_ai_${Date.now()}` }
  }

  async availableVoices(): Promise<string[]> {
    return [
      'Aria (Warm, Female)',
      'Nova (Neutral, Female)',
      'Atlas (Deep, Male)',
      'Rowan (Calm, Male)',
      'Sage (Bright, Neutral)',
    ]
  }
}

export const mockTelephonyProviderInstance = new MockTelephonyProviderClass()

// Backward-compatible exports
export const mockNumberProvider = mockTelephonyProviderInstance
export const mockTelephonyProvider = mockTelephonyProviderInstance
export const mockVoiceProvider = mockTelephonyProviderInstance
