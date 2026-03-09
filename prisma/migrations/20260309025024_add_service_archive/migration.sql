-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "service" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ContactMessage" ("createdAt", "email", "id", "message", "name") SELECT "createdAt", "email", "id", "message", "name" FROM "ContactMessage";
DROP TABLE "ContactMessage";
ALTER TABLE "new_ContactMessage" RENAME TO "ContactMessage";
CREATE INDEX "ContactMessage_service_createdAt_idx" ON "ContactMessage"("service", "createdAt");
CREATE INDEX "ContactMessage_archived_createdAt_idx" ON "ContactMessage"("archived", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
