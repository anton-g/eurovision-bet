/*
  Warnings:

  - You are about to drop the `CountryResult` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fifthPlaceCountryId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstPlaceCountryId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fourthPlaceCountryId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondPlaceCountryId` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `swedenPosition` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thirdPlaceCountryId` to the `Result` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CountryResult";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "firstPlaceCountryId" INTEGER NOT NULL,
    "secondPlaceCountryId" INTEGER NOT NULL,
    "thirdPlaceCountryId" INTEGER NOT NULL,
    "fourthPlaceCountryId" INTEGER NOT NULL,
    "fifthPlaceCountryId" INTEGER NOT NULL,
    "swedenPosition" INTEGER NOT NULL,
    CONSTRAINT "Result_firstPlaceCountryId_fkey" FOREIGN KEY ("firstPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Result_secondPlaceCountryId_fkey" FOREIGN KEY ("secondPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Result_thirdPlaceCountryId_fkey" FOREIGN KEY ("thirdPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Result_fourthPlaceCountryId_fkey" FOREIGN KEY ("fourthPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Result_fifthPlaceCountryId_fkey" FOREIGN KEY ("fifthPlaceCountryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Result" ("id", "year") SELECT "id", "year" FROM "Result";
DROP TABLE "Result";
ALTER TABLE "new_Result" RENAME TO "Result";
CREATE UNIQUE INDEX "Result_year_key" ON "Result"("year");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
