import { prisma } from "./prisma";

export type AuditEvent = 
  | "payment_created"
  | "payment_paid"
  | "payment_expired"
  | "payment_cancelled"
  | "game_session_created"
  | "game_scratch"
  | "game_completed"
  | "prize_awarded"
  | "webhook_received"
  | "config_updated"
  | "admin_login"
  | "admin_logout"
  | "backup_created"
  | "user_registered"
  | "error";

export interface AuditLogData {
  event: AuditEvent;
  data?: Record<string, unknown>;
  ip?: string;
}

/**
 * Registra um evento no log de auditoria
 */
export async function logAudit(event: AuditEvent, data?: Record<string, unknown>, ip?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        event,
        data: data ? JSON.stringify(data) : null,
        ip: ip || null,
      },
    });
  } catch (error) {
    console.error("[Audit] Erro ao registrar log:", error);
  }
}

/**
 * Registra criação de pagamento
 */
export async function logPaymentCreated(paymentId: string, amount: number, attempts: number, ip?: string) {
  await logAudit("payment_created", { paymentId, amount, attempts }, ip);
}

/**
 * Registra pagamento confirmado
 */
export async function logPaymentPaid(paymentId: string, amount: number, mpPaymentId?: string, ip?: string) {
  await logAudit("payment_paid", { paymentId, amount, mpPaymentId }, ip);
}

/**
 * Registra expiração de pagamento
 */
export async function logPaymentExpired(paymentId: string, amount: number, ip?: string) {
  await logAudit("payment_expired", { paymentId, amount }, ip);
}

/**
 * Registra sessão de jogo criada
 */
export async function logGameSessionCreated(sessionId: string, paymentId: string, ip?: string) {
  await logAudit("game_session_created", { sessionId, paymentId }, ip);
}

/**
 * Registra raspadinha (scratch)
 */
export async function logGameScratch(sessionId: string, position: number, result: boolean, ip?: string) {
  await logAudit("game_scratch", { sessionId, position, result }, ip);
}

/**
 * Registra jogo completado
 */
export async function logGameCompleted(sessionId: string, isWinner: boolean, totalRevealed: number, ip?: string) {
  await logAudit("game_completed", { sessionId, isWinner, totalRevealed }, ip);
}

/**
 * Registra prêmio concedido
 */
export async function logPrizeAwarded(sessionId: string, paymentId: string, amount: number, ip?: string) {
  await logAudit("prize_awarded", { sessionId, paymentId, amount }, ip);
}

/**
 * Registra webhook recebido
 */
export async function logWebhookReceived(provider: string, event: string, paymentId?: string, ip?: string) {
  await logAudit("webhook_received", { provider, event, paymentId }, ip);
}

/**
 * Registra login de admin
 */
export async function logAdminLogin(userId: string, email: string, ip?: string) {
  await logAudit("admin_login", { userId, email }, ip);
}

/**
 * Registra erro do sistema
 */
export async function logError(error: Error, context?: Record<string, unknown>, ip?: string) {
  await logAudit("error", {
    message: error.message,
    stack: error.stack,
    ...context,
  }, ip);
}

/**
 * Registra backup criado
 */
export async function logBackupCreated(backupId: string, size: number, tables: string[], ip?: string) {
  await logAudit("backup_created", { backupId, size, tables }, ip);
}
