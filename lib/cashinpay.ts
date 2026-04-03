// Integração com CashinPay API para pagamentos PIX
// Documentação: https://api.cashinpaybr.com/api/v1

const CASHINPAY_API_URL = "https://api.cashinpaybr.com/api/v1";

interface CashinPayTransactionResponse {
  success: boolean;
  data: {
    id: string;
    amount: {
      value: number;
      currency: string;
      cents: number;
    };
    net_amount: {
      value: number;
      currency: string;
      cents: number;
    };
    fee: {
      value: number;
      currency: string;
      cents: number;
    };
    status: "pending" | "paid" | "expired" | "cancelled";
    pix: {
      qrcode: string;
    };
    created_at: string;
  };
}

interface CashinPayError {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export async function createCashinPayPixPayment(
  amount: number,
  description: string,
  transactionId: string,
  customer: {
    name: string;
    email: string;
    phone: string;
    document?: string;
  }
) {
  try {
    const apiKey = process.env.CASHINPAY_API_KEY;

    if (!apiKey) {
      console.error("[CashinPay] API key não configurada");
      return {
        success: false,
        error: "CASHINPAY_API_KEY não configurada",
      };
    }

    console.log("[CashinPay] Criando transação PIX:", {
      amount,
      description,
      transactionId,
      customer: customer.name,
    });

    const requestBody = {
      amount,
      transaction_id: transactionId,
      description,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone.replace(/\D/g, ""),
        document: customer.document?.replace(/\D/g, ""),
      },
    };

    const response = await fetch(`${CASHINPAY_API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = (await response.json()) as CashinPayTransactionResponse | CashinPayError;

    if (!response.ok || !data.success) {
      console.error("[CashinPay] Erro na criação:", data);
      const errorMessage =
        "error" in data && typeof data.error === "object"
          ? data.error.message
          : `Erro HTTP ${response.status}`;
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log("[CashinPay] Transação criada:", data.data.id);

    return {
      success: true,
      paymentId: data.data.id,
      qrCode: data.data.pix.qrcode,
      amount: data.data.amount.value,
      netAmount: data.data.net_amount.value,
      fee: data.data.fee.value,
      status: data.data.status,
      createdAt: data.data.created_at,
    };
  } catch (error: unknown) {
    console.error("[CashinPay] Erro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function checkCashinPayTransactionStatus(transactionId: string) {
  try {
    const apiKey = process.env.CASHINPAY_API_KEY;

    if (!apiKey) {
      return { success: false, error: "API key não configurada" };
    }

    const response = await fetch(
      `${CASHINPAY_API_URL}/transactions/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = (await response.json()) as CashinPayTransactionResponse | CashinPayError;

    if (!response.ok || !data.success) {
      const errorMessage =
        "error" in data && typeof data.error === "object"
          ? data.error.message
          : `Erro HTTP ${response.status}`;
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      status: data.data.status,
      paid: data.data.status === "paid",
      amount: data.data.amount.value,
      netAmount: data.data.net_amount.value,
    };
  } catch (error: unknown) {
    console.error("[CashinPay] Erro ao verificar status:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return { success: false, error: errorMessage };
  }
}

// Validar assinatura do webhook
import { createHmac, timingSafeEqual } from "crypto";

export function validateCashinPayWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("[CashinPay] Erro ao validar assinatura:", error);
    return false;
  }
}

// Interface para eventos do webhook
export interface CashinPayWebhookEvent {
  event: "transaction.paid" | "transaction.expired" | "transaction.pending";
  webhook_id: number;
  timestamp: number;
  data: {
    id: string;
    external_id?: string;
    status: string;
    amount: {
      value: number;
      currency: string;
      cents: number;
    };
    paid_at?: string;
  };
}
