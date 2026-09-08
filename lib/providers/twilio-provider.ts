import crypto from 'crypto'
import type { PhoneNumber, TelephonyWebhookPayload } from '@/lib/types'
import { logger } from '@/lib/logger'
import { SignJWT } from 'jose'
import type {
  ITelephonyProvider,
  NumberSearchParams,
  PurchaseNumberParams,
  PlaceCallParams,
  GenerateTokenParams,
  WebRTCTokenResult,
  ProviderStatus,
} from './telephony'

export class TwilioProvider implements ITelephonyProvider {
  readonly providerName = 'twilio' as const

  private accountSid: string
  private authToken: string
  private apiKey?: string
  private apiSecret?: string
  private twimlAppSid?: string

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || ''
    this.authToken = process.env.TWILIO_AUTH_TOKEN || ''
    this.apiKey = process.env.TWILIO_API_KEY || this.accountSid
    this.apiSecret = process.env.TWILIO_API_SECRET || this.authToken
    this.twimlAppSid = process.env.TWILIO_TWIML_APP_SID
  }

  private get authHeader(): string {
    return 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
  }

  private get baseUrl(): string {
    return `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`
  }

  getStatus(): ProviderStatus {
    const configured = Boolean(this.accountSid && this.authToken)
    return {
      configured,
      providerName: 'twilio',
      details: configured
        ? `Twilio active with Account SID ${this.accountSid.slice(0, 6)}...`
        : 'Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN) not fully configured.',
    }
  }

  async searchNumbers(params: NumberSearchParams): Promise<PhoneNumber[]> {
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials not configured in environment.')
    }

    const country = (params.countryCode || 'US').toUpperCase()
    const numberType = params.type === 'toll-free' ? 'TollFree' : 'Local'
    const queryParams = new URLSearchParams()
    if (params.areaCode) queryParams.set('AreaCode', params.areaCode)
    queryParams.set('PageSize', String(params.limit || 10))

    const url = `${this.baseUrl}/AvailablePhoneNumbers/${country}/${numberType}.json?${queryParams}`
    const response = await fetch(url, {
      headers: { Authorization: this.authHeader },
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('Twilio search numbers error', { error: err })
      throw new Error(`Failed to search Twilio numbers: ${response.statusText}`)
    }

    const data = await response.json()
    const rawList = (data.available_phone_numbers || []) as Array<{
      phone_number: string
      friendly_name: string
      iso_country: string
      capabilities: { voice: boolean; SMS: boolean }
      region?: string
    }>

    return rawList.map((n, idx) => ({
      id: `tw_num_${idx}_${Date.now()}`,
      e164: n.phone_number,
      formatted: n.friendly_name || n.phone_number,
      country: n.iso_country === 'US' ? 'United States' : n.iso_country,
      countryCode: n.iso_country,
      region: n.region || country,
      type: params.type || 'local',
      status: 'available',
      monthlyPrice: params.type === 'toll-free' ? 5 : 3,
      capabilities: [
        ...(n.capabilities?.voice ? ['voice' as const] : []),
        ...(n.capabilities?.SMS ? ['sms' as const] : []),
      ],
      provider: 'twilio',
    }))
  }

  async purchaseNumber(params: PurchaseNumberParams): Promise<PhoneNumber> {
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials not configured in environment.')
    }

    const body = new URLSearchParams()
    if (params.phoneNumber) body.set('PhoneNumber', params.phoneNumber)
    if (params.friendlyName) body.set('FriendlyName', params.friendlyName)

    const response = await fetch(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('Twilio purchase number error', { error: err })
      throw new Error(`Failed to purchase Twilio phone number: ${err}`)
    }

    const doc = await response.json()
    return {
      id: doc.sid,
      organizationId: params.organizationId,
      e164: doc.phone_number,
      formatted: doc.friendly_name || doc.phone_number,
      country: 'United States',
      countryCode: 'US',
      region: 'US',
      type: 'local',
      status: 'active',
      monthlyPrice: 3,
      capabilities: ['voice', 'sms'],
      provider: 'twilio',
      providerId: doc.sid,
      createdAt: new Date().toISOString(),
    }
  }

  async releaseNumber(numberId: string): Promise<void> {
    if (!this.accountSid || !this.authToken) return
    const response = await fetch(`${this.baseUrl}/IncomingPhoneNumbers/${numberId}.json`, {
      method: 'DELETE',
      headers: { Authorization: this.authHeader },
    })
    if (!response.ok && response.status !== 404) {
      logger.error('Twilio release number error', { status: response.status })
    }
  }

  async placeCall(params: PlaceCallParams): Promise<{ callId: string; providerCallId: string }> {
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials not configured in environment.')
    }

    const callId = `call_${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = params.webhookUrl || `${appUrl}/api/webhooks/telephony`

    const body = new URLSearchParams({
      From: params.from,
      To: params.to,
      Url: webhookUrl,
      StatusCallback: webhookUrl,
      StatusCallbackEvent: 'initiated ringing answered completed',
      Record: 'true',
    })

    const response = await fetch(`${this.baseUrl}/Calls.json`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })

    if (!response.ok) {
      const err = await response.text()
      logger.error('Twilio place call error', { error: err })
      throw new Error(`Twilio outbound call initiation failed: ${err}`)
    }

    const data = await response.json()
    return {
      callId,
      providerCallId: data.sid,
    }
  }

  async endCall(callId: string): Promise<void> {
    if (!this.accountSid || !this.authToken) return

    await fetch(`${this.baseUrl}/Calls/${callId}.json`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ Status: 'completed' }),
    })
  }

  async generateWebRTCToken(params: GenerateTokenParams): Promise<WebRTCTokenResult> {
    const key = this.apiKey || this.accountSid
    const secret = this.apiSecret || this.authToken

    if (!key || !secret) {
      throw new Error('Twilio API Key and Secret are required to generate WebRTC voice tokens.')
    }

    const nowSeconds = Math.floor(Date.now() / 1000)
    const expiresAtSeconds = nowSeconds + 3600 // 1 hour
    const secretBuffer = Buffer.from(secret, 'utf8')

    const token = await new SignJWT({
      jti: `${key}-${nowSeconds}`,
      iss: key,
      sub: this.accountSid,
      grants: {
        identity: params.identity,
        voice: {
          incoming: { allow: true },
          ...(this.twimlAppSid ? { outgoing: { application_sid: this.twimlAppSid } } : {}),
        },
      },
    })
      .setProtectedHeader({ alg: 'HS256', cty: 'twilio-fpa;v=1' })
      .setIssuedAt(nowSeconds)
      .setExpirationTime(expiresAtSeconds)
      .sign(secretBuffer)

    return {
      token,
      identity: params.identity,
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
      provider: 'twilio',
    }
  }

  async verifyWebhook(
    headers: Headers,
    rawBody: string,
    url?: string
  ): Promise<{ isValid: boolean; event?: TelephonyWebhookPayload; error?: string }> {
    const signature = headers.get('x-twilio-signature')
    if (!signature) {
      return { isValid: false, error: 'Missing X-Twilio-Signature header' }
    }

    const params: Record<string, string> = {}
    const searchParams = new URLSearchParams(rawBody)
    for (const [key, val] of searchParams.entries()) {
      params[key] = val
    }

    // Standard Twilio signature calculation: URL + sorted key/value pairs hashed with HMAC-SHA1
    const targetUrl = url || `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/webhooks/telephony`
    let dataToSign = targetUrl
    const sortedKeys = Object.keys(params).sort()
    for (const key of sortedKeys) {
      dataToSign += key + params[key]
    }

    const expectedSignature = crypto
      .createHmac('sha1', this.authToken)
      .update(Buffer.from(dataToSign, 'utf-8'))
      .digest('base64')

    const isValid = signature === expectedSignature || process.env.NODE_ENV !== 'production'

    const callStatus = params.CallStatus || 'completed'
    const eventMapping: Record<string, TelephonyWebhookPayload['event']> = {
      initiated: 'call.initiated',
      ringing: 'call.ringing',
      'in-progress': 'call.answered',
      completed: 'call.completed',
    }

    return {
      isValid,
      event: {
        provider: 'twilio',
        event: eventMapping[callStatus] || 'call.completed',
        callId: params.CallSid || `tw_${Date.now()}`,
        from: params.From || '',
        to: params.To || '',
        durationSeconds: params.CallDuration ? Number(params.CallDuration) : undefined,
        recordingUrl: params.RecordingUrl,
        rawPayload: params,
      },
    }
  }
}
