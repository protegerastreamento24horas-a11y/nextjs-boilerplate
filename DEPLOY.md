# Deploy Guide - Raspadinha da Sorte

## 1. Preparação do Banco de Dados (Neon)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta
2. Crie um novo projeto
3. No dashboard, copie a **Connection String** (formato postgresql://)
4. Guarde essa string - vamos usar na Vercel

## 2. Deploy na Vercel

### 2.1 Preparar projeto local
```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login
```

### 2.2 Deploy inicial
```bash
# Na pasta do projeto
vercel

# Siga as instruções interativas
# Escolha sim para link com projeto existente ou crie novo
```

### 2.3 Configurar variáveis de ambiente
No dashboard da Vercel (vercel.com), vá em:
**Project Settings → Environment Variables**

Adicione estas variáveis:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `POSTGRES_PRISMA_URL` | Connection string do Neon | `postgresql://user:pass@host/db?sslmode=require` |
| `ADMIN_EMAIL` | Email do admin | `admin@seusite.com` |
| `ADMIN_PASSWORD` | Senha do admin | `SenhaSegura123!` |
| `NEXTAUTH_SECRET` | Token aleatório (32+ chars) | `use-gerador-online` |
| `NEXTAUTH_URL` | URL do deploy | `https://seu-projeto.vercel.app` |
| `NEXT_PUBLIC_PIX_KEY` | Sua chave Pix | `pix@seuemail.com` |

## 3. Migração do Banco

Após o primeiro deploy, execute:
```bash
# Localmente, com a variável POSTGRES_PRISMA_URL configurada
npx prisma migrate dev --name init
```

Ou use o botão "Deploy" do Neon que integra automaticamente com Vercel.

## 4. Acesso Admin

Após deploy, acesse:
- `/admin` → Login com ADMIN_EMAIL e ADMIN_PASSWORD
- Configure preço, prêmio, lucro mínimo e probabilidade

## 5. Pix Real (Opcional)

Para integração real com Mercado Pago:

1. Crie conta em [mercadopago.com.br](https://www.mercadopago.com.br)
2. Obtenha Access Token em: Desenvolvedores → Credenciais
3. Configure webhook apontando para: `https://seu-projeto.vercel.app/api/pix/webhook`
4. Adicione variáveis:
   - `MERCADO_PAGO_ACCESS_TOKEN`
   - `MERCADO_PAGO_WEBHOOK_SECRET`

## Troubleshooting

**Erro de conexão com banco:**
- Verifique se POSTGRES_PRISMA_URL está correta
- Confirme que sslmode=require está na URL

**Build falha:**
- Verifique se "postinstall": "prisma generate" está no package.json
- Execute `npx prisma generate` localmente

**Erro 500 na API:**
- Confira logs na Vercel (Functions tab)
- Verifique se migrations foram aplicadas
