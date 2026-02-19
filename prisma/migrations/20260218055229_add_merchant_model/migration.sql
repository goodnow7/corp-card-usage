-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CardUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usedAt" DATETIME NOT NULL,
    "merchant" TEXT NOT NULL,
    "amount" INTEGER,
    "purpose" TEXT NOT NULL,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "merchantId" TEXT,
    CONSTRAINT "CardUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CardUsage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CardUsage_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CardUsage" ("amount", "categoryId", "createdAt", "id", "memo", "merchant", "purpose", "updatedAt", "usedAt", "userId") SELECT "amount", "categoryId", "createdAt", "id", "memo", "merchant", "purpose", "updatedAt", "usedAt", "userId" FROM "CardUsage";
DROP TABLE "CardUsage";
ALTER TABLE "new_CardUsage" RENAME TO "CardUsage";
CREATE INDEX "CardUsage_userId_idx" ON "CardUsage"("userId");
CREATE INDEX "CardUsage_userId_usedAt_idx" ON "CardUsage"("userId", "usedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Merchant_userId_idx" ON "Merchant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userId_name_key" ON "Merchant"("userId", "name");
