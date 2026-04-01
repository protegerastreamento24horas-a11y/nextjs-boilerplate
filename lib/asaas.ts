// Integração com Asaas para gerar cobranças Pix
const ASAAS_API_URL = process.env.ASAAS_SANDBOX === "true" 
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";

interface AsaasPaymentResponse {
  id: string;
  value: number;
  netValue: number;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "REFUND_REQUESTED" | "CHARGEBACK_REQUESTED" | "CHARGEBACK_DISPUTE" | "AWAITING_CHARGEBACK_RESOLUTION" | "DUNNING_REQUESTED" | "DUNNING_RECEIVED" | "AWAITING_RISK_ANALYSIS";
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  pixQrCodeId?: string | null;
  invoiceUrl?: string;
  pixQrCode?: {
    id: string;
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  };
}

export async function createAsaasPixPayment(
  amount: number,
  description: string,
  externalReference: string,
  customerId?: string
) {
  try {
    const apiKey = process.env.ASAAS_API_KEY;
    
    if (!apiKey) {
      console.error("[Asaas] API key não configurada");
      return {
        success: false,
        error: "ASAAS_API_KEY não configurada",
      };
    }

    console.log("[Asaas] Criando cobrança Pix:", { amount, description, externalReference });

    // Se não tiver customerId, precisa criar um cliente primeiro ou usar genérico
    // Vou criar um cliente genérico para cada cobrança
    const customer = await createOrGetCustomer(apiKey, externalReference);
    
    if (!customer.success || !customer.customerId) {
      return {
        success: false,
        error: "Erro ao criar cliente no Asaas",
      };
    }

    // Criar cobrança Pix
    const paymentBody = {
      customer: customer.customerId,
      billingType: "PIX",
      value: amount,
      dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString().split("T")[0], // 30 minutos
      description,
      externalReference,
    };

    console.log("[Asaas] Enviando request:", JSON.stringify(paymentBody, null, 2));

    const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": apiKey,
      },
      body: JSON.stringify(paymentBody),
    });

    const paymentData: AsaasPaymentResponse = await paymentRes.json();

    if (!paymentRes.ok) {
      console.error("[Asaas] Erro na criação:", paymentData);
      return {
        success: false,
        error: `Erro Asaas: ${JSON.stringify(paymentData)}`,
      };
    }

    console.log("[Asaas] Cobrança criada:", paymentData.id);

    // Obter QR Code
    const qrCodeData = await getPixQrCode(apiKey, paymentData.id);

    return {
      success: true,
      paymentId: paymentData.id,
      value: paymentData.value,
      status: paymentData.status,
      qrCode: qrCodeData.encodedImage || null,
      qrCodeText: qrCodeData.payload || null,
      invoiceUrl: paymentData.invoiceUrl || null,
      raw: paymentData,
    };

  } catch (error: any) {
    console.error("[Asaas] Erro:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido",
    };
  }
}

async function createOrGetCustomer(apiKey: string, externalReference: string) {
  try {
    // Criar cliente com CPF (necessário para Asaas)
    const customerBody = {
      name: `Cliente ${externalReference.slice(-8)}`,
      email: `cliente-${externalReference.slice(-8)}@temp.com`,
      cpfCnpj: "11111111111", // CPF genérico para testes
      externalReference,
    };

    console.log("[Asaas] Criando cliente:", JSON.stringify(customerBody, null, 2));

    const res = await fetch(`${ASAAS_API_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": apiKey,
      },
      body: JSON.stringify(customerBody),
    });

    const data = await res.json();

    if (!res.ok) {
      // Se erro for email ou CPF duplicado, buscar cliente existente
      if (data.errors?.some((e: any) => e.code === "DUPLICATED_VALUE")) {
        // Buscar cliente por externalReference
        const searchRes = await fetch(
          `${ASAAS_API_URL}/customers?externalReference=${externalReference}`,
          {
            headers: { "access_token": apiKey },
          }
        );
        const searchData = await searchRes.json();
        if (searchData.data?.length > 0) {
          console.log("[Asaas] Cliente existente encontrado:", searchData.data[0].id);
          return { success: true, customerId: searchData.data[0].id };
        }
      }
      
      console.error("[Asaas] Erro ao criar cliente:", data);
      return { success: false, error: data };
    }

    console.log("[Asaas] Cliente criado:", data.id);
    return { success: true, customerId: data.id };
  } catch (error: any) {
    console.error("[Asaas] Erro ao criar cliente:", error);
    return { success: false, error: error.message };
  }
}

async function getPixQrCode(apiKey: string, paymentId: string) {
  try {
    // Obter QR Code do pagamento Pix
    const res = await fetch(
      `${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`,
      {
        headers: { "access_token": apiKey },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("[Asaas] Erro ao obter QR Code:", data);
      return { encodedImage: null, payload: null };
    }

    console.log("[Asaas] QR Code obtido:", !!data.encodedImage);

    return {
      encodedImage: data.encodedImage || null,
      payload: data.payload || null,
    };
  } catch (error: any) {
    console.error("[Asaas] Erro ao obter QR Code:", error);
    return { encodedImage: null, payload: null };
  }
}

export async function checkAsaasPaymentStatus(paymentId: string) {
  try {
    const apiKey = process.env.ASAAS_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "API key não configurada" };
    }

    const res = await fetch(
      `${ASAAS_API_URL}/payments/${paymentId}`,
      {
        headers: { "access_token": apiKey },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data };
    }

    return {
      success: true,
      status: data.status,
      paid: ["RECEIVED", "CONFIRMED"].includes(data.status),
      raw: data,
    };
  } catch (error: any) {
    console.error("[Asaas] Erro ao verificar status:", error);
    return { success: false, error: error.message };
  }
}
