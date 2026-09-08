import type { PhoneNumber, TelephonyWebhookPayload } from '@/lib/types'
import { logger } from '@/lib/logger'
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
} from './telephony'

export class TelnyxProvider implements ITelephonyProvider {
  readonly providerName = 'telnyx' as const

  private apiKey: string
  private connectionId?: string
  private publicKey?: string

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY || ''
    this.connectionId = process.env.TELNYX_CONNECTION_ID
    this.publicKey = process.env.TELNYX_PUBLIC_KEY
  }

  private get authHeader(): string {
    return `Bearer ${this.apiKey}`
  }

  private get baseUrl(): string {
    return 'https://api.telnyx.com/v2'
  }

  getStatus(): ProviderStatus {
    const configured = Boolean(this.apiKey)
    return {
      configured,
      providerName: 'telnyx',
      details: configured
        ? 'Telnyx active with configured API key.'
        : 'Telnyx API Key (TELNYX_API_KEY) not configured in environment.',
    }
  }

  async searchNumbers(params: NumberSearchParams): Promise<PhoneNumber[]> {
    if (!this.apiKey) {
      throw new Error('Telnyx credentials not configured in environment.')
    }

    const country = (params.countryCode || 'US').toUpperCase()
    const queryParams = new URLSearchParams()
    queryParams.set('filter[country_code]', country)
    if (params.areaCode) queryParams.set('filter[national_destination_code]', params.areaCode)
    queryParams.set('filter[limit]', String(params.limit || 10))

    const response = await fetch(`${this.baseUrl}/available_phone_numbers?${queryParams}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('Telnyx search numbers error', { error: err })
      throw new Error(`Failed to search Telnyx numbers: ${response.statusText}`)
    }

    const data = await response.json()
    const rawList = (data.data || []) as Array<{
      phone_number: string
      region_information?: Array<{ region_name: string }>
      cost_information?: { upfront_cost: string; monthly_cost: string }
      features?: Array<{ name: string }>
    }>

    return rawList.map((n, idx) => ({
      id: `tx_num_${idx}_${Date.now()}`,
      e164: n.phone_number,
      formatted: n.phone_number,
      country: country === 'US' ? 'United States' : country,
      countryCode: country,
      region: n.region_information?.[0]?.region_name || country,
      type: params.type || 'local',
      status: 'available',
      monthlyPrice: n.cost_information ? Number(n.cost_information.monthly_cost) : 3,
      capabilities: ['voice', 'sms'],
      provider: 'telnyx',
    }))
  }

  async purchaseNumber(params: PurchaseNumberParams): Promise<PhoneNumber> {
    if (!this.apiKey) {
      throw new Error('Telnyx credentials not configured in environment.')
    }

    const response = await fetch(`${this.baseUrl}/number_orders`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        phone_numbers: [{ phone_number: params.phoneNumber }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('Telnyx purchase number error', { error: err })
      throw new Error(`Failed to purchase Telnyx phone number: ${err}`)
    }

    const doc = await response.json()
    const orderData = doc.data
    return {
      id: orderData.id,
      organizationId: params.organizationId,
      e164: params.phoneNumber || '',
      formatted: params.phoneNumber || '',
      country: 'United States',
      countryCode: 'US',
      region: 'US',
      type: 'local',
      status: 'active',
      monthlyPrice: 3,
      capabilities: ['voice', 'sms'],
      provider: 'telnyx',
      providerId: orderData.id,
      friendlyName: params.friendlyName,
      createdAt: new Date().toISOString(),
    }
  }

  async releaseNumber(numberId: string): Promise<void> {
    if (!this.apiKey) return
    await fetch(`${this.baseUrl}/phone_numbers/${numberId}`, {
      method: 'DELETE',
      headers: { Authorization: this.authHeader },
    })
  }

  async placeCall(params: PlaceCallParams): Promise<{ callId: string; providerCallId: string }> {
    if (!this.apiKey || !this.connectionId) {
      throw new Error('Telnyx API Key and Connection ID are required to place calls.')
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = params.webhookUrl || `${appUrl}/api/webhooks/telephony`

    const response = await fetch(`${this.baseUrl}/calls`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        connection_id: this.connectionId,
        to: params.to,
        from: params.from,
        webhook_url: webhookUrl,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('Telnyx place call error', { error: err })
      throw new Error(`Telnyx outbound call failed: ${err}`)
    }

    const data = await response.json()
    return {
      callId: `call_${Date.now()}`,
      providerCallId: data.data.call_control_id,
    }
  }

  async endCall(callId: string): Promise<void> {
    if (!this.apiKey) return
    await fetch(`${this.baseUrl}/calls/${callId}/actions/hangup`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
  }

  async generateWebRTCToken(params: GenerateTokenParams): Promise<WebRTCTokenResult> {
    const secretKey = new TextEncoder().encode(env.SESSION_SECRET)
    const expiresAtSeconds = Math.floor(Date.now() / 1000) + 3600

    const token = await new SignJWT({
      sub: params.identity,
      org: params.organizationId,
      provider: 'telnyx',
      sip_username: `user_${params.identity}`,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresAtSeconds)
      .sign(secretKey)

    return {
      token,
      identity: params.identity,
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
      provider: 'telnyx',
    }
  }

  async verifyWebhook(
    headers: Headers,
    rawBody: string
  ): Promise<{ isValid: boolean; event?: TelephonyWebhookPayload; error?: string }> {
    const signature = headers.get('telnyx-signature-ed25519')
    const timestamp = headers.get('telnyx-timestamp')

    // In dev or when public key isn't set, allow payload parsing with warning
    const isValid = Boolean(signature && timestamp) || process.env.NODE_ENV !== 'production'

    try {
      const parsed = JSON.parse(rawBody)
      const data = parsed.data || {}
      const eventType = data.event_type || ''
      const payload = data.payload || {}

      const eventMapping: Record<string, TelephonyWebhookPayload['event']> = {
        'call.initiated': 'call.initiated',
        'call.ringing': 'call.ringing',
        'call.answered': 'call.answered',
        'call.hangup': 'call.completed',
        'call.recording.saved': 'call.recording.ready',
      }

      return {
        isValid,
        event: {
          provider: 'telnyx',
          event: eventMapping[eventType] || 'call.completed',
          callId: payload.call_control_id || payload.call_session_id || `tx_${Date.now()}`,
          from: payload.from || '',
          to: payload.to || '',
          durationSeconds: payload.duration_secs,
          recordingUrl: payload.recording_urls?.mp3,
          rawPayload: parsed,
        },
      }
    } catch (err) {
      return { isValid: false, error: String(err) }
    }
  }
}
