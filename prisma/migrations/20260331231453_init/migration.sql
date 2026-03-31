-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pixId" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "revealed" TEXT NOT NULL DEFAULT '[]',
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "precoTentativa" REAL NOT NULL DEFAULT 2.50,
    "custoPremio" REAL NOT NULL DEFAULT 50.00,
    "lucroMinimo" REAL NOT NULL DEFAULT 20.00,
    "probabilidade" REAL NOT NULL DEFAULT 0.10,
    "modoManual" BOOLEAN NOT NULL DEFAULT false,
    "forcarPremio" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "data" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pixId_key" ON "Payment"("pixId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSession_paymentId_key" ON "GameSession"("paymentId");
