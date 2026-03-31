import { prisma } from "./prisma";

interface GameConfig {
  precoTentativa: number;
  custoPremio: number;
  lucroMinimo: number;
  probabilidade: number;
  modoManual: boolean;
  forcarPremio: boolean;
}

export async function calculateShouldWin(
  config: GameConfig
): Promise<boolean> {
  // Modo manual
  if (config.modoManual) {
    if (config.forcarPremio) {
      // Resetar após uso
      await prisma.config.update({
        where: { id: "default" },
        data: { forcarPremio: false },
      });
      return true;
    }
    return false;
  }

  // Modo automático: controle financeiro
  const [arrecadadoResult, premiosPagos] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.gameSession.count({ where: { isWinner: true } }),
  ]);

  const totalArrecadado = arrecadadoResult._sum.amount ?? 0;
  const custoAcumulado = premiosPagos * config.custoPremio;
  const lucroAtual = totalArrecadado - custoAcumulado;

  // Simula o lucro após a premiação
  const lucroAposPremiacao = lucroAtual - config.custoPremio;

  // Nunca permite prejuízo abaixo do mínimo
  if (lucroAposPremiacao < config.lucroMinimo) {
    return false;
  }

  // Aplica probabilidade base
  return Math.random() < config.probabilidade;
}

export function generateGameResults(isWinnerSession: boolean): boolean[] {
  const results = new Array(10).fill(false) as boolean[];

  if (isWinnerSession) {
    // Coloca o prêmio em posição aleatória
    const winIndex = Math.floor(Math.random() * 10);
    results[winIndex] = true;
  }

  return results;
}

export async function getOrCreateConfig() {
  return prisma.config.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}
