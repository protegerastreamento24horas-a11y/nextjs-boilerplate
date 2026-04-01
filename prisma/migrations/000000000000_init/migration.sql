-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pixId" TEXT,
    "mpPaymentId" TEXT,
    "qrCode" TEXT,
    "qrCodeText" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pixId_key" ON "Payment"("pixId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mpPaymentId_key" ON "Payment"("mpPaymentId");

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "revealed" TEXT NOT NULL DEFAULT '[]',
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_paymentId_key" ON "GameSession"("paymentId");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "precoTentativa" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
    "custoPremio" DOUBLE PRECISION NOT NULL DEFAULT 50.00,
    "lucroMinimo" DOUBLE PRECISION NOT NULL DEFAULT 20.00,
    "probabilidade" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "modoManual" BOOLEAN NOT NULL DEFAULT false,
    "forcarPremio" BOOLEAN NOT NULL DEFAULT false,
    "jackpotAcumulado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metaJackpot" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "rtpTarget" DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    "sequenciaSemPremio" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
