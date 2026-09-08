import { z } from 'zod'

/**
 * Centennial Connect Production Environment Configuration Schema
 * Validates and provides strongly-typed access to environment variables.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // MongoDB
  MONGODB_URI: z.string().optional(),
  MONGODB_USER: z.string().optional(),
  MONGODB_PASSWORD: z.string().optional(),
  MONGODB_DB: z.string().default('centennial_connect'),
  MONGODB_HOST: z.string().optional(),

  // Session & Security Secrets
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters for AES-GCM / HS256 encryption')
    .default(
      // In development fallback to a known dev-safe hash or ENCRYPTION_KEY if provided
      process.env.ENCRYPTION_KEY || 'development_session_secret_min_32_characters_long_key_cc'
    ),
  ENCRYPTION_KEY: z.string().optional(),
  ENCRYPTION_IV: z.string().optional(),

  // Telephony & Voice AI
  TELEPHONY_PROVIDER: z.enum(['mock', 'twilio', 'telnyx']).default('mock'),
  TELEPHONY_API_KEY: z.string().optional(),
  TELEPHONY_API_SECRET: z.string().optional(),
  VOICE_AI_PROVIDER: z.enum(['mock', 'elevenlabs', 'openai', 'vapi']).default('mock'),
  VOICE_AI_API_KEY: z.string().optional(),

  // Email / Notifications
  BREVO_API_KEY: z.string().optional(),
  MAIL_HOST: z.string().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional().default(587),
  MAIL_SECURE: z.coerce.boolean().optional().default(false),
  MAIL_FROM_EMAIL: z.string().email().optional().or(z.literal('')),
  MAIL_FROM_NAME: z.string().optional().default('Centennial Connect'),

  // Storage / Media
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Google reCAPTCHA
  RECAPTCHA_SECRET_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

function getEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const formatted = result.error.format()
    console.error('❌ Invalid environment variables configuration:', formatted)
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment variable validation failed in production. Check runtime logs.')
    }
  }

  return result.success ? result.data : (process.env as unknown as Env)
}

export const env = getEnv()
