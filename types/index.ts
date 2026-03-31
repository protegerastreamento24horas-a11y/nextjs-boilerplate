export interface PaymentData {
  id: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  pixId: string | null;
  attempts: number;
  createdAt: Date;
}

export interface GameSessionData {
  id: string;
  paymentId: string;
  results: boolean[];
  revealed: number[];
  isWinner: boolean;
  createdAt: Date;
}

export interface ConfigData {
  id: string;
  precoTentativa: number;
  custoPremio: number;
  lucroMinimo: number;
  probabilidade: number;
  modoManual: boolean;
  forcarPremio: boolean;
}

export interface AdminStats {
  totalArrecadado: number;
  totalPagamentos: number;
  totalJogadas: number;
  premiosPagos: number;
  lucroAtual: number;
  recentSessions: Array<{
    id: string;
    isWinner: boolean;
    amount: number;
    createdAt: string;
  }>;
}
