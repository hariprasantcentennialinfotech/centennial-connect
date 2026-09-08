/**
 * Application structured error types for Centennial Connect.
 * Provides consistent error codes, HTTP status codes, and user-friendly error responses.
 */

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: unknown

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required. Please log in to continue.', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', details?: unknown) {
    super(`${resource} not found.`, 404, 'NOT_FOUND', details)
    this.name = 'NotFoundError'
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters.', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.', details?: unknown) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details)
    this.name = 'RateLimitError'
  }
}

export class TelephonyError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'TELEPHONY_PROVIDER_ERROR', details)
    this.name = 'TelephonyError'
  }
}

export class VoiceAiError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'VOICE_AI_PROVIDER_ERROR', details)
    this.name = 'VoiceAiError'
  }
}

/**
 * Normalizes any caught error into a standardized object suitable for API responses or Server Actions.
 */
export function formatErrorResponse(err: unknown): { error: string; code: string; status: number } {
  if (err instanceof AppError) {
    return {
      error: err.message,
      code: err.code,
      status: err.statusCode,
    }
  }

  const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
  return {
    error: message,
    code: 'INTERNAL_ERROR',
    status: 500,
  }
}
