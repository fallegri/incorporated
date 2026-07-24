/**
 * Audit Logger — Records security-relevant actions.
 * In production, send to external logging service (e.g., Axiom, Datadog).
 * For now, uses structured console logs that Vercel captures.
 */

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "REGISTER"
  | "LOGOUT"
  | "2FA_ENABLED"
  | "2FA_VERIFIED"
  | "2FA_FAILED"
  | "DOC_UPLOADED"
  | "DOC_DELETED"
  | "AI_PROVIDER_CHANGED"
  | "LINEAMIENTO_GENERATED"
  | "LINEAMIENTO_SAVED"
  | "ROLE_CHANGED"
  | "RATE_LIMITED";

interface AuditEntry {
  timestamp: string;
  action: AuditAction;
  userId?: string;
  ip?: string;
  details?: Record<string, unknown>;
}

export function auditLog(
  action: AuditAction,
  userId?: string,
  ip?: string,
  details?: Record<string, unknown>
) {
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    ip,
    details,
  };

  // Structured log — Vercel captures these in Functions logs
  console.log(JSON.stringify({ level: "audit", ...entry }));
}
