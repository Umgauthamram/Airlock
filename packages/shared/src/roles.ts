/**
 * Human and Machine Roles & Permission Validation
 */

export const Role = {
  VIEWER: 'viewer',
  OPERATOR: 'operator',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof Role)[keyof typeof Role];

const ROLE_RANKS: Record<UserRole, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
};

/**
 * Checks whether userRole has at least requiredRole privileges.
 */
export function hasMinimumRole(userRole: UserRole | string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const userRank = ROLE_RANKS[userRole as UserRole] || 0;
  const requiredRank = ROLE_RANKS[requiredRole];
  return userRank >= requiredRank;
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (value === 'viewer' || value === 'operator' || value === 'admin');
}
