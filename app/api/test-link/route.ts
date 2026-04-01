import { NextRequest, NextResponse } from 'next/server';

// API de teste para verificar domínio do link de afiliado
export async function GET(request: NextRequest) {
  const baseUrl = "https://nextjs-boilerplate-qz9nwoyzb.vercel.app";
  
  return NextResponse.json({
    success: true,
    baseUrl: baseUrl,
    testLink: `${baseUrl}/?ref=TEST123`,
    message: "API de teste - domínio correto"
  });
}
