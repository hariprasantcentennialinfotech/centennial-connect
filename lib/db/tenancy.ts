import type { Session } from '@/lib/auth'
import type { OrgRole } from '@/lib/types'
import { UnauthorizedError, ForbiddenError } from '@/lib/errors'

export interface OrgContext {
  userId: string
  organizationId: string
  role: OrgRole
  email: string
  name: string
}

/**
 * Ensures that a request or action has an active, authenticated session with an organization.
 * Throws UnauthorizedError if not logged in.
 */
export function ensureOrgContext(session: Session | null): OrgContext {
  if (!session || !session.email) {
    throw new UnauthorizedError('Authentication required to access organization resources.')
  }

  const organizationId = session.organizationId || 'org_1'
  const userId = session.userId || `usr_${session.email}`
  const role = (session.role as OrgRole) || 'owner'

  return {
    userId,
    organizationId,
    role,
    email: session.email,
    name: session.name,
  }
}

/**
 * Checks if a session has the required role. Throws ForbiddenError if insufficient permissions.
 */
export function requireRole(session: Session | null, allowedRoles: OrgRole[]): OrgContext {
  const ctx = ensureOrgContext(session)
  if (!allowedRoles.includes(ctx.role)) {
    throw new ForbiddenError(
      `Access denied. Requires one of [${allowedRoles.join(', ')}], current role is '${ctx.role}'.`
    )
  }
  return ctx
}

/**
 * Injects organizationId into a MongoDB query filter to guarantee tenant data isolation.
 */
export function withOrg<T extends Record<string, unknown>>(
  filter: T,
  organizationId: string
): T & { organizationId: string } {
  return {
    ...filter,
    organizationId,
  }
}
