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
    const payment = new Payment(client);

    const body = {
      transaction_amount: amount,
      description: description,
      payment_method_id: "pix",
      payer: {
        email: "cliente@exemplo.com", // Email genérico
      },
      notification_url: `${process.env.NEXTAUTH_URL}/api/pix/webhook`,
      external_reference: paymentId, // Referência interna
    };

    const response = await payment.create({ body });

    return {
      success: true,
      mpPaymentId: String(response.id),
      qrCode: response.point_of_interaction?.transaction_data?.qr_code_base64 || null,
      qrCodeText: response.point_of_interaction?.transaction_data?.qr_code || null,
      ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url || null,
      status: response.status,
    };
  } catch (error: any) {
    console.error("Erro ao criar pagamento Pix:", error);
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
