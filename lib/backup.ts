import { prisma } from "./prisma";
import { logBackupCreated } from "./audit";

export interface BackupData {
  version: string;
  timestamp: string;
  database: string;
  tables: {
    payments: unknown[];
    gameSessions: unknown[];
    configs: unknown[];
    auditLogs: unknown[];
    transactions: unknown[];
  };
  stats: {
    totalPayments: number;
    totalSessions: number;
    totalAuditLogs: number;
    totalTransactions: number;
  };
}

/**
 * Cria um backup completo do banco de dados
 */
export async function createBackup(ip?: string): Promise<{ success: boolean; data?: BackupData; error?: string; size?: number }> {
  try {
    const [
      payments,
      gameSessions,
      configs,
      auditLogs,
      transactions,
    ] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10000, // Limitar para não sobrecarregar
      }),
      prisma.gameSession.findMany({
        orderBy: { createdAt: "desc" },
        take: 10000,
      }),
      prisma.config.findMany(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 5000,
      }),
    ]);

    const backup: BackupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      database: "raspadinha_db",
      tables: {
        payments,
        gameSessions,
        configs,
        auditLogs,
        transactions,
      },
      stats: {
        totalPayments: payments.length,
        totalSessions: gameSessions.length,
        totalAuditLogs: auditLogs.length,
        totalTransactions: transactions.length,
      },
    };

    const backupJson = JSON.stringify(backup, null, 2);
    const size = new TextEncoder().encode(backupJson).length;

    // Log do backup
    await logBackupCreated(
      `backup_${Date.now()}`,
      size,
      ["payments", "gameSessions", "configs", "auditLogs", "transactions"],
      ip
    );

    return {
      success: true,
      data: backup,
      size,
    };
  } catch (error) {
    console.error("[Backup] Erro ao criar backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Exporta backup como JSON string
 */
export function exportBackupToJson(backup: BackupData): string {
  return JSON.stringify(backup, null, 2);
}

/**
 * Formata o tamanho do backup em unidades legíveis
 */
export function formatBackupSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Calcula estatísticas do banco de dados
 */
export async function getDatabaseStats() {
  const [
    totalPayments,
    totalSessions,
    totalConfigs,
    totalAuditLogs,
    totalTransactions,
    paidPayments,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.gameSession.count(),
    prisma.config.count(),
    prisma.auditLog.count(),
    prisma.transaction.count(),
    prisma.payment.count({ where: { status: "paid" } }),
  ]);

  return {
    total: {
      payments: totalPayments,
      sessions: totalSessions,
      configs: totalConfigs,
      auditLogs: totalAuditLogs,
      transactions: totalTransactions,
    },
    paid: paidPayments,
    pending: totalPayments - paidPayments,
  };
}
