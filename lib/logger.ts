/**
 * Production server-side logger for Centennial Connect.
 * Provides structured JSON logging in production and formatted logs in development.
 * Automatically sanitizes sensitive keys (tokens, secrets, passwords).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'secret',
  'token',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'session',
  'session_secret',
  'encryption_key',
  'mail_pass',
  'brevo_api_key',
  'google_client_secret',
])

function sanitize(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, depth + 1))
  }

  const sanitized: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitize(val, depth + 1)
    } else {
      sanitized[key] = val
    }
  }
  return sanitized
}

class Logger {
  private isProd = process.env.NODE_ENV === 'production'

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString()
    const safeMeta = meta ? (sanitize(meta) as Record<string, unknown>) : undefined

    if (this.isProd) {
      const payload = {
        timestamp,
        level,
        message,
        ...(safeMeta ? { meta: safeMeta } : {}),
      }
      const serialized = JSON.stringify(payload)
      if (level === 'error') {
        console.error(serialized)
      } else if (level === 'warn') {
        console.warn(serialized)
      } else {
        console.log(serialized)
      }
    } else {
      const prefix = {
        debug: '🔍 [DEBUG]',
        info: 'ℹ️ [INFO]',
        warn: '⚠️ [WARN]',
        error: '❌ [ERROR]',
      }[level]

      if (safeMeta && Object.keys(safeMeta).length > 0) {
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
          `${prefix} ${message}`,
          safeMeta
        )
      } else {
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
          `${prefix} ${message}`
        )
      }
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_LEVEL === 'debug') {
      this.log('debug', message, meta)
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta)
  }

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error !== undefined
        ? { rawError: String(error) }
        : {}

    this.log('error', message, {
      ...errorDetails,
      ...(meta || {}),
    })
  }
}

export const logger = new Logger()
