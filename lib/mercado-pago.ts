import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
  options: { timeout: 5000 },
});

export async function createPixPayment(
  amount: number,
  description: string,
  paymentId: string
) {
  try {
    console.log("[MP] Criando pagamento Pix:", { amount, description, paymentId });
    console.log("[MP] Token configurado:", process.env.MERCADO_PAGO_ACCESS_TOKEN ? "SIM" : "NÃO");
    
    const payment = new Payment(client);

    const body = {
      transaction_amount: amount,
      description: description,
      payment_method_id: "pix",
      payer: {
        email: "cliente@exemplo.com",
      },
      notification_url: `${process.env.NEXTAUTH_URL}/api/mp-webhook`,
      external_reference: paymentId,
    };

    console.log("[MP] Enviando request:", body);
    
    const response = await payment.create({ body });
    
    console.log("[MP] Resposta recebida:", JSON.stringify(response, null, 2));

    const qrCode = response.point_of_interaction?.transaction_data?.qr_code_base64 || null;
    const qrCodeText = response.point_of_interaction?.transaction_data?.qr_code || null;
    
    console.log("[MP] QR Code gerado:", qrCode ? "SIM" : "NÃO");
    console.log("[MP] QR Code Text:", qrCodeText ? "SIM" : "NÃO");

    return {
      success: true,
      mpPaymentId: String(response.id),
      qrCode,
      qrCodeText,
      ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url || null,
      status: response.status,
    };
  } catch (error: any) {
    console.error("[MP] Erro ao criar pagamento Pix:", error);
    console.error("[MP] Error message:", error.message);
    console.error("[MP] Error details:", error.cause);
    return {
      success: false,
      error: error.message || "Erro ao criar pagamento",
    };
  }
}

export async function checkPaymentStatus(mpPaymentId: string) {
  try {
    const payment = new Payment(client);
    const response = await payment.get({ id: mpPaymentId });

    return {
      success: true,
      status: response.status, // pending, approved, cancelled, etc
      statusDetail: response.status_detail,
      externalReference: response.external_reference,
    };
  } catch (error: any) {
    console.error("Erro ao verificar pagamento:", error);
    return {
      success: false,
      error: error.message || "Erro ao verificar status",
    };
  }
}
