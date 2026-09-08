import type { ITelephonyProvider, ProviderStatus } from './telephony'
import { MockTelephonyProviderClass, mockTelephonyProviderInstance } from './mock-provider'
import { TwilioProvider } from './twilio-provider'
import { TelnyxProvider } from './telnyx-provider'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger'

let cachedProvider: ITelephonyProvider | null = null

/**
 * Factory function to retrieve the active telephony provider instance.
 * Automatically selects Twilio, Telnyx, or Mock based on environment configuration.
 */
export function getTelephonyProvider(): ITelephonyProvider {
  if (cachedProvider) {
    return cachedProvider
  }

  const selected = env.TELEPHONY_PROVIDER || 'mock'

  if (selected === 'twilio') {
    const twilio = new TwilioProvider()
    const status = twilio.getStatus()
    if (status.configured) {
      logger.info('Initialized Twilio Telephony Provider.')
      cachedProvider = twilio
      return cachedProvider
    }
    logger.warn('Twilio selected but credentials incomplete. Falling back to simulated Mock provider.')
  } else if (selected === 'telnyx') {
    const telnyx = new TelnyxProvider()
    const status = telnyx.getStatus()
    if (status.configured) {
      logger.info('Initialized Telnyx Telephony Provider.')
      cachedProvider = telnyx
      return cachedProvider
    }
    logger.warn('Telnyx selected but credentials incomplete. Falling back to simulated Mock provider.')
  }

  cachedProvider = mockTelephonyProviderInstance
  return cachedProvider
}

export * from './telephony'
export * from './mock-provider'
export { TwilioProvider } from './twilio-provider'
export { TelnyxProvider } from './telnyx-provider'
