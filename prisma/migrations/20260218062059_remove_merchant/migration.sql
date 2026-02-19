/*
  Warnings:

  - You are about to drop the `Merchant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `merchantId` on the `CardUsage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Merchant_userId_name_key";

-- DropIndex
DROP INDEX "Merchant_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Merchant";
PRAGMA foreign_keys=on;

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
    CONSTRAINT "CardUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CardUsage_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CardUsage" ("amount", "categoryId", "createdAt", "id", "memo", "merchant", "purpose", "updatedAt", "usedAt", "userId") SELECT "amount", "categoryId", "createdAt", "id", "memo", "merchant", "purpose", "updatedAt", "usedAt", "userId" FROM "CardUsage";
DROP TABLE "CardUsage";
ALTER TABLE "new_CardUsage" RENAME TO "CardUsage";
CREATE INDEX "CardUsage_userId_idx" ON "CardUsage"("userId");
CREATE INDEX "CardUsage_userId_usedAt_idx" ON "CardUsage"("userId", "usedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
