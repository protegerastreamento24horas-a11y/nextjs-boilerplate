import { prisma } from "./prisma";

interface GameConfig {
  precoTentativa: number;
  custoPremio: number;
  lucroMinimo: number;
  probabilidade: number;
  modoManual: boolean;
  forcarPremio: boolean;
  jackpotAcumulado: number;
  metaJackpot: number;
  rtpTarget: number;
  sequenciaSemPremio: number;
}

export async function calculateShouldWin(
  config: GameConfig,
  currentBet: number = config.precoTentativa
): Promise<boolean> {
  // Modo manual
  if (config.modoManual) {
    if (config.forcarPremio) {
      await prisma.config.update({
        where: { id: "default" },
        data: { forcarPremio: false },
      });
      return true;
    }
    return false;
  }

  // Modo automático: lógica inteligente com jackpot
  
  // 1. Verificar se jackpot atingiu meta (libera prêmio garantido)
  if (config.jackpotAcumulado >= config.metaJackpot) {
    // Resetar jackpot após premiação
    await prisma.config.update({
      where: { id: "default" },
      data: { jackpotAcumulado: 0 },
    });
    return true;
  }

  // 2. Calcular RTP atual
  const [arrecadadoResult, premiosPagos, entradas] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.gameSession.count({ where: { isWinner: true } }),
    prisma.transaction.aggregate({
      where: { type: "in" },
      _sum: { amount: true },
    }),
  ]);

  const totalArrecadado = arrecadadoResult._sum.amount ?? 0;
  const totalSaidas = (premiosPagos * config.custoPremio);
  const entradasTotais = entradas._sum.amount ?? 0;
  
  // RTP = Retorno ao jogador (quanto % foi pago de volta em prêmios)
  const rtpAtual = totalArrecadado > 0 ? totalSaidas / totalArrecadado : 0;

  // 3. Lógica de sequência (quanto mais tempo sem prêmio, maior a chance)
  const fatorSequencia = Math.min(config.sequenciaSemPremio * 0.02, 0.15); // Max +15%
  
  // 4. Probabilidade base + ajustes
  let probabilidadeReal = config.probabilidade + fatorSequencia;
  
  // Se RTP está muito abaixo do target, aumenta chance de ganhar
  if (rtpAtual < config.rtpTarget * 0.8) {
    probabilidadeReal *= 1.5; // Aumenta 50% para equilibrar
  }
  
  // Se RTP está muito acima, reduz chance (protege lucro)
  if (rtpAtual > config.rtpTarget * 1.3) {
    probabilidadeReal *= 0.5; // Reduz 50%
  }

  // 5. Verificar lucro mínimo
  const lucroAtual = totalArrecadado - totalSaidas;
  const lucroAposPremiacao = lucroAtual - config.custoPremio;
  
  if (lucroAposPremiacao < config.lucroMinimo) {
    return false;
  }

  // 6. Decisão final
  return Math.random() < probabilidadeReal;
}

export function generateGameResults(isWinnerSession: boolean): boolean[] {
  const results = new Array(10).fill(false) as boolean[];

  if (isWinnerSession) {
    // Posição aleatória para o prêmio
    const winIndex = Math.floor(Math.random() * 10);
    results[winIndex] = true;
  }

  return results;
}

// Nova função: Calcular multiplicador baseado no jackpot
export function calculateMultiplier(config: GameConfig): number {
  if (config.jackpotAcumulado <= 0) return 1;
  
  // Multiplicador de 1x até 3x baseado no jackpot
  const multiplicador = 1 + (config.jackpotAcumulado / config.metaJackpot) * 2;
  return Math.min(multiplicador, 3); // Max 3x
}

export async function getOrCreateConfig(): Promise<GameConfig> {
  return prisma.config.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  }) as Promise<GameConfig>;
}
