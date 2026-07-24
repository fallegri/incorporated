/**
 * Role-Based Access Control (RBAC)
 * Checks if a user's role has permission to perform an action.
 */

type Role = "SUPER_ADMIN" | "ADMIN" | "DIRECTOR" | "JEFE_AREA" | "JEFE_PROYECTO" | "COLABORADOR" | "INDIVIDUAL";

// Role hierarchy — higher number = more permissions
const ROLE_LEVEL: Record<Role, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  DIRECTOR: 60,
  JEFE_AREA: 40,
  JEFE_PROYECTO: 30,
  COLABORADOR: 20,
  INDIVIDUAL: 10,
};

/**
 * Check if user has at least the minimum required role
 */
export function hasMinRole(userRole: string, minRole: Role): boolean {
  const userLevel = ROLE_LEVEL[userRole as Role] ?? 0;
  const minLevel = ROLE_LEVEL[minRole] ?? 999;
  return userLevel >= minLevel;
}

/**
 * Check if user has one of the allowed roles
 */
export function hasRole(userRole: string, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole as Role);
}

/**
 * Check if user can manage another user (must be higher role)
 */
export function canManageUser(managerRole: string, targetRole: string): boolean {
  const managerLevel = ROLE_LEVEL[managerRole as Role] ?? 0;
  const targetLevel = ROLE_LEVEL[targetRole as Role] ?? 999;
  return managerLevel > targetLevel;
}

/**
 * Permission checks for specific actions
 */
export const permissions = {
  canChangeAIProvider: (role: string) => hasMinRole(role, "ADMIN"),
  canManageOrg: (role: string) => hasMinRole(role, "ADMIN"),
  canManageCargos: (role: string) => hasMinRole(role, "JEFE_AREA"),
  canInviteUsers: (role: string) => hasMinRole(role, "ADMIN"),
  canApproveLineamientos: (role: string) => hasMinRole(role, "JEFE_AREA"),
  canViewAllDocs: (role: string) => hasMinRole(role, "COLABORADOR"),
  canUploadDocs: (role: string) => true, // All authenticated users
  canUseAI: (role: string) => true, // All authenticated users
  canDeleteDocs: (role: string) => hasMinRole(role, "ADMIN"),
};
