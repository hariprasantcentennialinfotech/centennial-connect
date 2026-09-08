import { calls, phoneNumbers, searchableNumbers } from '@/lib/mock-data'
import type { Call, PhoneNumber } from '@/lib/types'
import type {
  NumberProvider,
  NumberSearchParams,
  TelephonyProvider,
  VoiceProvider,
} from './telephony'

class MockNumberProvider implements NumberProvider {
  async search(params: NumberSearchParams): Promise<PhoneNumber[]> {
    return searchableNumbers.filter((n) => {
      if (params.countryCode && n.countryCode !== params.countryCode) return false
      if (params.type && n.type !== params.type) return false
      return true
    })
  }
  async purchase(numberId: string): Promise<PhoneNumber> {
    const found = searchableNumbers.find((n) => n.id === numberId)
    if (!found) throw new Error('Number not available')
    return { ...found, status: 'active' }
  }
  async list(): Promise<PhoneNumber[]> {
    return phoneNumbers
  }
  async release(): Promise<void> {
    return
  }
}

class MockTelephonyProvider implements TelephonyProvider {
  async placeCall(): Promise<{ callId: string }> {
    return { callId: `mock_${Date.now()}` }
  }
  async endCall(): Promise<void> {
    return
  }
  async listCalls(): Promise<Call[]> {
    return calls
  }
}

class MockVoiceProvider implements VoiceProvider {
  async startAgentCall(): Promise<{ callId: string }> {
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

export const mockNumberProvider = new MockNumberProvider()
export const mockTelephonyProvider = new MockTelephonyProvider()
export const mockVoiceProvider = new MockVoiceProvider()
