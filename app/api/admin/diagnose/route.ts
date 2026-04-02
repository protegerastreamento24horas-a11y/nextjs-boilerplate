import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  // Verificar autenticação
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {},
    config: null,
    asaas: {},
    errors: [],
  };

  // 1. Verificar variáveis de ambiente
  diagnostics.environment = {
    hasAsaasKey: !!process.env.ASAAS_API_KEY,
    keyLength: process.env.ASAAS_API_KEY?.length || 0,
    keyPrefix: process.env.ASAAS_API_KEY?.substring(0, 10) + "..." || "N/A",
    sandbox: process.env.ASAAS_SANDBOX,
    nodeEnv: process.env.NODE_ENV,
  };

  if (!process.env.ASAAS_API_KEY) {
    diagnostics.errors.push("ASAAS_API_KEY não configurada");
  }

  // 2. Verificar configuração do banco
  try {
    const config = await prisma.config.findUnique({
      where: { id: "default" },
    });
    diagnostics.config = config;
    
    // Verificar configuração mínima
    if (!config) {
      diagnostics.errors.push("Configuração não encontrada no banco de dados");
    }
  } catch (error: any) {
    diagnostics.errors.push(`Erro ao buscar config: ${error.message}`);
  }

  // 3. Testar conexão com Asaas
  if (process.env.ASAAS_API_KEY) {
    try {
      const baseUrl = process.env.ASAAS_SANDBOX === "true"
        ? "https://sandbox.asaas.com/api/v3"
        : "https://api.asaas.com/v3";

      // Testar status da API
      const statusRes = await fetch(`${baseUrl}/status`, {
        headers: { access_token: process.env.ASAAS_API_KEY },
      });
      
      diagnostics.asaas.status = {
        ok: statusRes.ok,
        status: statusRes.status,
      };

      // Testar criação de cliente (dry-run)
      const testCustomerRes = await fetch(`${baseUrl}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: process.env.ASAAS_API_KEY,
        },
        body: JSON.stringify({
          name: "Teste Diagnóstico",
          email: `teste-${Date.now()}@diagnostico.temp`,
          cpfCnpj: "52998224725",
        }),
      });

      const customerData = await testCustomerRes.json();
      
      diagnostics.asaas.customerTest = {
        success: testCustomerRes.ok,
        status: testCustomerRes.status,
        error: !testCustomerRes.ok ? customerData : null,
      };

      if (!testCustomerRes.ok) {
        diagnostics.errors.push(`Erro ao criar cliente: ${JSON.stringify(customerData)}`);
      }

    } catch (error: any) {
      diagnostics.asaas.error = error.message;
      diagnostics.errors.push(`Erro de conexão Asaas: ${error.message}`);
    }
  }

  // 4. Resumo
  diagnostics.summary = {
    ready: diagnostics.errors.length === 0,
    issue: diagnostics.errors[0] || null,
  };

  return NextResponse.json(diagnostics);
}
