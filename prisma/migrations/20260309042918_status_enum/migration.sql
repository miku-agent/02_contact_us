/*
  Warnings:

  - You are about to drop the column `archived` on the `ContactMessage` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ContactMessage" ("createdAt", "email", "id", "message", "name", "service") SELECT "createdAt", "email", "id", "message", "name", "service" FROM "ContactMessage";
DROP TABLE "ContactMessage";
ALTER TABLE "new_ContactMessage" RENAME TO "ContactMessage";
CREATE INDEX "ContactMessage_service_createdAt_idx" ON "ContactMessage"("service", "createdAt");
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
