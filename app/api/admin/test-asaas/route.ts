import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ASAAS_API_KEY;
    const isSandbox = process.env.ASAAS_SANDBOX === "true";
    
    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        error: "ASAAS_API_KEY não configurada",
        envVars: {
          hasKey: !!apiKey,
          sandbox: isSandbox,
        }
      }, { status: 400 });
    }

    const baseUrl = isSandbox 
      ? "https://sandbox.asaas.com/api/v3" 
      : "https://api.asaas.com/v3";

    // Test connection to Asaas
    const res = await fetch(`${baseUrl}/status`, {
      headers: { access_token: apiKey },
    });

    const data = await res.json();

    return NextResponse.json({
      configured: true,
      sandbox: isSandbox,
      apiStatus: res.ok ? "online" : "error",
      apiResponse: data,
      envCheck: {
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10) + "...",
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
